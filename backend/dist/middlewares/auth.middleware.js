import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
export const isAuthenticated = async (req, res, next) => {
    try {
        const token = req.cookies?.token;
        if (!token) {
            return next(new ApiError(401, "Not authorized"));
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (error) {
        return next(new ApiError(401, "Invalid or expired token"));
    }
};
export const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new ApiError(401, "Not authenticated"));
        }
        if (!roles.includes(req.user.role)) {
            return next(new ApiError(403, "Access denied"));
        }
        next();
    };
};
//# sourceMappingURL=auth.middleware.js.map