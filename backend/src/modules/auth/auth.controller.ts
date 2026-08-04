import { NextFunction, Request, Response } from "express";
import * as authService from "./auth.service.js";
import { changePasswordService, forgotPasswordService, getProfileService } from "./auth.service.js";
import { ApiError } from "../../utils/ApiError.js";
import { User } from "./auth.model.js";

export const register = async (req: Request, res: Response) => {
  const result = await authService.registerUser(req.body);
  res.status(201).json(result);
};

export const sendOTP = async (req: Request, res: Response) => {
  const { email, type } = req.body;
  const result = await authService.requestActionOtp(email, type);
  res.status(201).json(result);

}

export const verify = async (req: Request, res: Response) => {
  const { otp, type } = req.body;
  let email = req.body.email;

  if (type === "verifyEmail") {
    if (!req.user) {
      throw new ApiError(401, "You must be logged in to verify your email.");
    }

    const account = await User.findById(req.user.userId).select("email");
    if (!account) {
      throw new ApiError(404, "Account not found");
    }

    email = account.email;
  }

  const result = await authService.processOtpVerification(email, otp, type);

  if (type === "verifyEmail") {
    res.cookie("emailVerified", "true", {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 1 * 24 * 60 * 60 * 1000,
    });
  }

  res.status(201).json(result);
};

export const login = async (req: Request, res: Response) => {
  const result = await authService.loginUser(req.body);
  const { token, user } = result;

  // ✅ Set cookie here
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // true in prod
    sameSite: "lax",
    maxAge: 1 * 24 * 60 * 60 * 1000, // 7 days
  });
  res.cookie("role", user.role, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 1 * 24 * 60 * 60 * 1000,
  });

  res.cookie("isLoggedIn", "true", {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 1 * 24 * 60 * 60 * 1000,
  });
  res.cookie("emailVerified", String(user.emailVerified), {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 1 * 24 * 60 * 60 * 1000,
  });
  res.status(201).json({
    success: true,
    user,
    message: "Login successfull."
  });
};

export const logOutUserController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {

  await authService.logOutUserService(res);

  // Return a structured JSON response matching your client-side toast systems
  res.status(200).json({
    success: true,
    message: "Logged out successfully.",
  });
};

export const verify2FA = async (req: Request, res: Response) => {
  const { email, otp } = req.body;
  const result = await authService.verify2FA(email, otp);
  res.json(result);
};

export const forgotPasswordController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const result = await forgotPasswordService(email, password);
    return res.status(200).json(result);
  } catch (err: any) {
    next(err);
  }
};

export const changePasswordController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.userId; // set by isAuthenticated middleware
    const { currentPassword, password } = req.body;

    console.log(typeof currentPassword, typeof password)

    await changePasswordService(userId, currentPassword, password);

    return res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (err: any) {
    next(err)
  }
};


export const adminOnly = async (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "Welcome Admin",
  });
};

export const getProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user.userId as string;

    const user = await getProfileService(userId);
    res.status(200).json({
      success: true,
      user
    });
  } catch (error: any) {
    next(error);
  }
}



