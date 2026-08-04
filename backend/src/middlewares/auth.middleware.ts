import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";


interface JwtPayload {
  userId: string;
  role: string;
}

export const isAuthenticated = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return next(new ApiError(401, "Not authorized"));
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload;

    req.user = decoded;

    next();
  } catch (error) {
    return next(new ApiError(401, "Invalid or expired token"));
  }
};
export const restrictTo = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {

    if (!req.user) {
      return next(new ApiError(401, "Not authenticated"));
    }

    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, "Access denied"));
    }

    next();
  };
};