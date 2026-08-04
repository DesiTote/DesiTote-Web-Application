import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface JwtPayload {
    userId: string;
    role: string;
}

// Attaches req.user if a valid token is present. NEVER blocks the request —
// missing, malformed, or expired tokens all just fall through as a guest.
// Use this only on routes that must work for both logged-in and anonymous users.
export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies?.token;

        if (!token) {
            return next();
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
        req.user = decoded;
        next();
    } catch (error) {
        // Invalid/expired token — proceed as guest instead of erroring
        next();
    }
};