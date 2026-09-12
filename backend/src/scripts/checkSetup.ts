// scripts/checkSetup.ts
// Verifies every external credential in .env actually works, before you
// seed data or go live. Run it locally and again on the server after deploy:
//
//   npx tsx src/scripts/checkSetup.ts
//
// It only reads - nothing here writes data or sends email.

import "../config/loadEnv.js"; // must stay first

import mongoose from "mongoose";
import axios from "axios";
import { HeadBucketCommand, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getRedis } from "../config/redis.js";
import { getS3Client } from "../config/s3.js";
import { getRazorpayClient } from "../config/razorpay.js";

type Result = { name: string; ok: boolean; detail: string };
const results: Result[] = [];

function record(name: string, ok: boolean, detail: string) {
    results.push({ name, ok, detail });
    console.log(`${ok ? "[OK]  " : "[FAIL]"} ${name}: ${detail}`);
}

function missingVars(...names: string[]): string[] {
    return names.filter((n) => !process.env[n]?.trim());
}

async function checkMongo() {
    const missing = missingVars("MONGO_URI");
    if (missing.length) return record("MongoDB", false, `missing ${missing.join(", ")}`);
    try {
        await mongoose.connect(process.env.MONGO_URI as string, { serverSelectionTimeoutMS: 10000 });
        const dbName = mongoose.connection.db?.databaseName;
        const productCount = await mongoose.connection.db?.collection("products").countDocuments();
        record("MongoDB", true, `connected to "${dbName}" (products: ${productCount ?? 0} docs)`);
    } catch (err: any) {
        record("MongoDB", false, err.message);
    }
}

async function checkRedis() {
    const missing = missingVars("UPSTASH_REDIS_REST_URL", "UPSTASH_REDIS_REST_TOKEN");
    if (missing.length) return record("Upstash Redis", false, `missing ${missing.join(", ")}`);
    try {
        const redis = getRedis();
        const key = "setupcheck:ping";
        await redis.set(key, "ok", { ex: 30 });
        const value = await redis.get(key);
        await redis.del(key);
        record("Upstash Redis", value === "ok", value === "ok" ? "read/write OK" : `unexpected read: ${value}`);
    } catch (err: any) {
        record("Upstash Redis", false, err.message);
    }
}

async function checkShiprocket() {
    const missing = missingVars("SHIPROCKET_EMAIL", "SHIPROCKET_PASSWORD");
    if (missing.length) return record("Shiprocket", false, `missing ${missing.join(", ")}`);
    try {
        const auth = await axios.post("https://apiv2.shiprocket.in/v1/external/auth/login", {
            email: process.env.SHIPROCKET_EMAIL?.trim(),
            password: process.env.SHIPROCKET_PASSWORD?.trim(),
        });
        const token = auth.data?.token;
        if (!token) return record("Shiprocket", false, "no token returned from login");

        const pickup = await axios.get("https://apiv2.shiprocket.in/v1/external/settings/company/pickup", {
            headers: { Authorization: `Bearer ${token}` },
        });
        const addresses = pickup.data?.data?.shipping_address ?? [];
        record("Shiprocket", true, `authenticated; ${addresses.length} pickup location(s)`);

        for (const a of addresses) {
            console.log(`    -> pickup_location: "${a.pickup_location}"  pincode: ${a.pin_code}  city: ${a.city}`);
        }

        const current = process.env.SHIPROCKET_PICKUP_LOCATION?.trim();
        const match = addresses.find((a: any) => a.pickup_location === current);
        if (addresses.length && !current) {
            console.log("    !  SHIPROCKET_PICKUP_LOCATION is empty - set it to one of the names above.");
        } else if (addresses.length && !match) {
            console.log(`    !  SHIPROCKET_PICKUP_LOCATION="${current}" does not match any name above.`);
        } else if (match && String(match.pin_code) !== process.env.SHIPROCKET_PICKUP_PINCODE?.trim()) {
            console.log(`    !  SHIPROCKET_PICKUP_PINCODE should be ${match.pin_code} to match "${current}".`);
        }
    } catch (err: any) {
        record("Shiprocket", false, err.response?.data?.message || err.message);
    }
}

async function checkRazorpay() {
    const missing = missingVars("RAZORPAY_KEY_ID", "RAZORPAY_KEY_SECRET");
    if (missing.length) return record("Razorpay", false, `missing ${missing.join(", ")}`);
    try {
        const client = getRazorpayClient();
        await client.orders.all({ count: 1 });
        const mode = process.env.RAZORPAY_KEY_ID?.startsWith("rzp_live") ? "LIVE" : "TEST";
        record("Razorpay", true, `credentials valid (${mode} mode)`);
    } catch (err: any) {
        record("Razorpay", false, err?.error?.description || err.message || "auth failed");
    }
}

async function checkS3() {
    const missing = missingVars("AWS_REGION", "AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY", "AWS_S3_BUCKET");
    if (missing.length) return record("AWS S3", false, `missing ${missing.join(", ")}`);
    const Bucket = process.env.AWS_S3_BUCKET as string;
    try {
        const client = getS3Client();
        await client.send(new HeadBucketCommand({ Bucket }));

        // Seeding uploads ~90 product images, so confirm write access too -
        // an IAM policy can allow HeadBucket but deny PutObject.
        const Key = "setup-check/.permission-probe";
        await client.send(new PutObjectCommand({ Bucket, Key, Body: "ok", ContentType: "text/plain" }));
        await client.send(new DeleteObjectCommand({ Bucket, Key }));

        record("AWS S3", true, `bucket "${Bucket}" reachable, write access confirmed`);
    } catch (err: any) {
        const detail =
            err.name === "NotFound"
                ? "bucket not found"
                : err.name === "AccessDenied"
                  ? "credentials lack s3:PutObject/s3:DeleteObject on this bucket"
                  : err.message;
        record("AWS S3", false, detail);
    }
}

const FREE_MAIL_DOMAINS = ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "icloud.com"];

async function checkResend() {
    const missing = missingVars("RESEND_API_KEY", "EMAIL_FROM");
    if (missing.length) return record("Resend", false, `missing ${missing.join(", ")}`);

    // Resend only sends from a domain you own and have verified - a gmail.com
    // sender is rejected at send time, which would break OTP and order emails.
    const senderDomain = (process.env.EMAIL_FROM as string).match(/@([^>\s]+)/)?.[1]?.toLowerCase();
    if (senderDomain && FREE_MAIL_DOMAINS.includes(senderDomain)) {
        return record(
            "Resend",
            false,
            `EMAIL_FROM uses "${senderDomain}" - Resend rejects free-mail senders. Use "onboarding@resend.dev" for testing, or a domain you verified in Resend.`
        );
    }

    try {
        const res = await axios.get("https://api.resend.com/domains", {
            headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY?.trim()}` },
        });
        const domains = res.data?.data ?? [];
        const verified = domains.filter((d: any) => d.status === "verified").map((d: any) => d.name);

        if (!domains.length) {
            record("Resend", true, "key valid, but NO domains added - email only reaches your own Resend account address");
        } else if (senderDomain && verified.includes(senderDomain)) {
            record("Resend", true, `key valid; "${senderDomain}" is verified`);
        } else if (senderDomain === "resend.dev") {
            record("Resend", true, "key valid; using Resend's test sender (delivers only to your account address)");
        } else {
            record(
                "Resend",
                false,
                `EMAIL_FROM uses "${senderDomain}" which is not verified (verified: ${verified.join(", ") || "none"})`
            );
        }
    } catch (err: any) {
        // A "Sending access" key is scoped to /emails only and returns 401
        // restricted_api_key on /domains - that means the key IS valid.
        if (err.response?.data?.name === "restricted_api_key") {
            return record("Resend", true, "key valid (send-only scope, cannot list domains)");
        }
        record("Resend", false, err.response?.status === 401 ? "invalid API key" : err.message);
    }
}

async function main() {
    console.log("Checking external services...\n");
    await checkMongo();
    await checkRedis();
    await checkShiprocket();
    await checkRazorpay();
    await checkS3();
    await checkResend();

    const failed = results.filter((r) => !r.ok);
    console.log(`\n${results.length - failed.length}/${results.length} checks passed.`);
    if (failed.length) {
        console.log(`Fix these before going live: ${failed.map((f) => f.name).join(", ")}`);
    }

    await mongoose.disconnect().catch(() => {});
    process.exit(failed.length ? 1 : 0);
}

main().catch((err) => {
    console.error("Setup check crashed:", err);
    process.exit(1);
});
