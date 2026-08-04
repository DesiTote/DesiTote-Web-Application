// ─── modules/auth/auth.service.ts (corrected) ───────────────────
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User, UserRole } from "./auth.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { getRedis } from "../../config/redis.js";
import { sendEmail } from "../../email/email.service.js";
import { Response } from "express";

import { z } from "zod";
import { registerSchema } from "./auth.validation.js";
import { otpEmailTemplate } from "../../email/templates/otp.template.js";
import { generateOTP } from "../../utils/otp.js";
import { sha256 } from "../../utils/hash.js";
import { baseOptions } from "./auth.constant.js";
import { EMAIL_SUBJECTS, OTP_EMAIL_CONTENT, OtpOperationType } from "../../constants/customer/email.js";
import { welcomeEmailTemplate } from "../../email/templates/welcome.js";
import { resetPasswordSuccessEmailTemplate } from "../../email/templates/reset-password.js";


type RegisterFormData = z.infer<typeof registerSchema>



const LOGIN_MAX_ATTEMPTS = 3;
const LOGIN_LOCKOUT_SECONDS = 86400; // 24 hours

export const registerUser = async (data: RegisterFormData) => {
    const redis = getRedis();
    const isEmailVerified = await redis.get(`verified:register:${data.email}`);

    if (!isEmailVerified) {
        throw new ApiError(401, "Please verify your email address via OTP first.");
    }

    const existingUser = await User.findOne({ email: data.email });

    if (existingUser) throw new ApiError(401, "We couldn't complete your registration. Please try again.");

    const hashedPassword = await bcrypt.hash(data.password, 10);
    await User.create({
        ...data,
        password: hashedPassword,
        emailVerified: true,
        role: UserRole.CUSTOMER,
    });

    await redis.del(`verified:register:${data.email}`);
    await sendEmail({
        to: "desitotes0401@gmail.com",
        subject: EMAIL_SUBJECTS.welcome,
        html: welcomeEmailTemplate(data.fullName),
    });
    return { success: true, message: "User registered successfully." };
};

export const loginUser = async (data: any) => {
    const redis = getRedis();
    const loginFailKey = `login:fail:${data.email}`;

    const user = await User.findOne({
        email: data.email
    }).lean();

    if (!user) throw new ApiError(401, "Invalid credentials.");

    const failData = await redis.hgetall<{ attempts: string; isBlocked?: string }>(loginFailKey);

    if (failData?.isBlocked) {
        const ttlSeconds = await redis.ttl(loginFailKey);
        const remainingHours = Math.ceil(ttlSeconds / 3600);
        throw new ApiError(423, `Too many failed login attempts. Try again after ${remainingHours} hours.`);
    }

    const isMatch = await bcrypt.compare(data.password, user.password);

    if (!isMatch) {
        const isFirstFailure = !failData || Object.keys(failData).length === 0;
        const currentAttempts = await redis.hincrby(loginFailKey, "attempts", 1);

        if (isFirstFailure) {
            await redis.expire(loginFailKey, LOGIN_LOCKOUT_SECONDS);
        }

        if (currentAttempts >= LOGIN_MAX_ATTEMPTS) {
            await redis.hset(loginFailKey, { isBlocked: "true" });
            await redis.expire(loginFailKey, LOGIN_LOCKOUT_SECONDS);
            throw new ApiError(423, "Too many failed login attempts. This account is locked for 24 hours.");
        }

        const attemptsRemaining = LOGIN_MAX_ATTEMPTS - currentAttempts;
        throw new ApiError(401, `Invalid credentials. ${attemptsRemaining} attempt(s) remaining before lockout.`);
    }

    // ✅ Successful login — clear any prior failure tracking
    await redis.del(loginFailKey);

    const token = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET as string,
        { expiresIn: "1d" }
    );

    return {
        token,
        user: {
            fullName: user.fullName,
            emailVerified: user.emailVerified,
            role: user.role,
            email: user.email,
        }
    };
};


export const logOutUserService = async (res: Response): Promise<void> => {
    res.clearCookie("token", baseOptions);
    res.clearCookie("role", baseOptions);

    res.clearCookie("isLoggedIn", {
        ...baseOptions,
        httpOnly: false,
    });
    res.clearCookie("emailVerified", {
        ...baseOptions,
        httpOnly: false,
    });
};


export const requestActionOtp = async (email: string, type: OtpOperationType) => {

    if (!email || !type) throw new ApiError(400, "Please provide a valid email address and otp type.");

    const redis = getRedis();
    const hashKey = `auth:${type}:${email}`;

    const verifiedKey = `verified:${type}:${email}`;

    const isAlreadyVerified =
        await redis.get(verifiedKey);

    if (isAlreadyVerified) {
        return {
            success: true,
            alreadyVerified: true,
            message: "Email already verified.Continue your process",
        };
    }

    // 1. Contextual DB Validation Checks
    const existingUser = await User.findOne({ email }).lean();
    if (type === "register" && existingUser?.emailVerified) {
        throw new ApiError(409, "If this email isn't already registered, we've sent a verification OTP.");
    }
    if ((type === "forgot" || type === "login") && !existingUser) {
        throw new ApiError(404, "If this email registered, we've sent a verification OTP.");
    }


    if (type === "verifyEmail") {
        if (!existingUser) {
            throw new ApiError(404, "If this email registered, we've sent a verification OTP");
        }
        if (existingUser.emailVerified) {
            return {
                success: true,
                alreadyVerified: true,
                message: "Email already verified.",
            };
        }
    }

    const authData = await redis.hgetall<{ code: string; attempts: number; nextAvailableAt: string; maxLockout: string, isBlocked: boolean }>(hashKey);

    if (authData && Object.keys(authData).length > 0) {
        if (authData.isBlocked) {
            const ttlSeconds = await redis.ttl(hashKey);
            const remainingHours = Math.ceil(ttlSeconds / 3600);
            throw new ApiError(423, `This pathway is locked due to too many failed attempts. Try again after ${remainingHours} hours.`)
        }

        if (authData.nextAvailableAt) {
            const nextAvailableTime = parseInt(authData.nextAvailableAt, 10);
            const currentTime = Date.now();

            if (currentTime < nextAvailableTime) {
                const secondsLeft = Math.ceil((nextAvailableTime - currentTime) / 1000);
                throw new ApiError(429, `Please wait ${secondsLeft} seconds before requesting another OTP.`);
            }
        }
    }

    const otp = generateOTP();

    const emailContent = OTP_EMAIL_CONTENT[type];

    await sendEmail({
        to: "desitotes0401@gmail.com",
        subject: EMAIL_SUBJECTS[type],
        html: otpEmailTemplate({
            title: emailContent.title,
            description: emailContent.description,
            otp,
        }),
    });

    // 4. Update the Data Structure Matrix
    const lockoutDuration = (type === "order" || type === "register" || type === "verifyEmail") ? 7200 : 86400;

    const nextAvailableTimestamp = Date.now() + 30000;

    const existingAttempts = authData?.attempts || 0;
    const hashedOtp = sha256(otp);
    await redis.hset(hashKey, {
        code: hashedOtp,
        attempts: existingAttempts,
        nextAvailableAt: nextAvailableTimestamp.toString(),
        maxLockout: lockoutDuration.toString()
    });

    await redis.expire(hashKey, 300);

    return {
        success: true,
        message: `We've sent a verification OTP for ${type}.`,
        resendAvailableIn: 30
    };
};

export const processOtpVerification = async (
    email: string,
    otp: string,
    type: OtpOperationType,
    successExpiry = 600
) => {
    if (!email || !type || !otp) {
        throw new ApiError(400, "Please provide an email address, OTP, and OTP type.");
    }

    const redis = getRedis();
    const hashKey = `auth:${type}:${email}`;
    const verifiedKey = `verified:${type}:${email}`; // Define verified key

    const authData = await redis.hgetall<{
        code: string;
        attempts: string;
        maxLockout: string;
        isBlocked: string | boolean;
    }>(hashKey);

    if (!authData || Object.keys(authData).length === 0) {
        throw new ApiError(400, "OTP has expired or never existed. Please request a new one.");
    }

    // Convert string/boolean checks safely
    const isBlocked = authData.isBlocked === true || authData.isBlocked === "true";

    if (isBlocked) {
        const ttlSeconds = await redis.ttl(hashKey);
        const remainingHours = Math.ceil(ttlSeconds / 3600);
        throw new ApiError(423, `This action track is locked. Try again after ${remainingHours} hours.`);
    }

    const hashedOtp = sha256(otp);
    if (authData.code !== hashedOtp) {
        const currentAttempts = await redis.hincrby(hashKey, "attempts", 1);

        if (currentAttempts >= 3) {
            const penaltyExpiry = parseInt(authData.maxLockout || "86400", 10);

            await redis.hset(hashKey, { isBlocked: "true" });
            await redis.expire(hashKey, penaltyExpiry);

            throw new ApiError(423, "Maximum limits reached. This validation track is blocked.");
        }

        const attemptsRemaining = 3 - currentAttempts;
        throw new ApiError(400, `Invalid OTP token entered. ${attemptsRemaining} attempts remaining.`);
    }

    // --- FIX 1: Set the verified key in Redis with expiration ---
    await redis.set(verifiedKey, "true", { ex: successExpiry });

    // --- FIX 2: Clean up the OTP request hash key once used ---
    await redis.del(hashKey);

    if (type === "verifyEmail") {
        await User.updateOne({ email }, { $set: { emailVerified: true } });
    }

    return { success: true, message: "OTP verified successfully." };
};

export const forgotPasswordService = async (email: string, password: string) => {
    const redis = getRedis();

    const isEmailVerified = await redis.get(`verified:forgot:${email}`);

    if (!isEmailVerified) {
        throw new ApiError(401, "Please verify your email to set new password.");
    }

    const user = await User.findOne({ email });
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();

    await redis.del(`verified:forgot:${email}`);
    await sendEmail({
        to: 'desitotes0401@gmail.com',
        subject: EMAIL_SUBJECTS.passwordChanged,
        html: resetPasswordSuccessEmailTemplate(),
    });
    return { message: "Password reset successful" };
};

export const changePasswordService = async (userId: string, currentPassword: string, newPassword: string) => {
    const user = await User.findById(userId).select("+password");

    if (!user) {
        throw new ApiError(404, "Account not found");
    }

    if (!user.password) {
        throw new ApiError(400, "Password change is not available for this account");
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
        throw new ApiError(400, "Current password is incorrect");
    }

    const isSameAsOld = await bcrypt.compare(newPassword, user.password);
    if (isSameAsOld) {
        throw new ApiError(400, "New password must be different from current password");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    await user.save();

    await sendEmail({
        to: "desitotes0401@gmail.com",
        subject: EMAIL_SUBJECTS.passwordChanged,
        html: resetPasswordSuccessEmailTemplate(),
    });

    return true;
};

export const verify2FA = async (email: string, otp: string) => {
    const user = await User.findOne({ email });

    if (!user) throw new ApiError(401, "Invalid OTP");

    const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET as string,
        { expiresIn: "1d" }
    );

    await user.save();

    return { token };
};

export const getProfileService = async (userId: string) => {
    const user = await User.findById(userId).select("-password -_id");

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    return user;
};