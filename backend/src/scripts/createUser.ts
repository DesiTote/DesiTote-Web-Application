// scripts/createUser.ts
// Creates a user directly, or promotes an existing one. Needed because there
// is deliberately no public route that can grant ADMIN, and because the normal
// signup flow requires an emailed OTP.
//
//   npx tsx src/scripts/createUser.ts <email> <password> <ADMIN|CUSTOMER> ["Full Name"] [mobile]
//
// If the email already exists, only the role and password are updated.

import "../config/loadEnv.js"; // must stay first

import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import { User, UserRole } from "../modules/auth/auth.model.js";

async function main() {
    const [email, password, roleArg, fullNameArg, mobileArg] = process.argv.slice(2);

    if (!email || !password) {
        console.error('Usage: npx tsx src/scripts/createUser.ts <email> <password> <ADMIN|CUSTOMER> ["Full Name"] [mobile]');
        process.exit(1);
    }

    const role = roleArg === "ADMIN" ? UserRole.ADMIN : UserRole.CUSTOMER;
    const fullName = fullNameArg || "DesiTotes Admin";
    const mobileNumber = mobileArg || "9999999999";

    await connectDB();

    const hashed = await bcrypt.hash(password, 10);
    const existing = await User.findOne({ email: email.toLowerCase().trim() });

    if (existing) {
        existing.password = hashed;
        existing.role = role;
        existing.emailVerified = true;
        await existing.save();
        console.log(`Updated existing user ${existing.email} --- role ${role}, password reset.`);
    } else {
        const created = await User.create({
            fullName,
            email: email.toLowerCase().trim(),
            password: hashed,
            mobileNumber,
            role,
            emailVerified: true,
        });
        console.log(`Created ${created.email} with role ${role}.`);
    }

    await mongoose.disconnect();
    process.exit(0);
}

main().catch(async (err) => {
    console.error("Failed:", err.message);
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
});
