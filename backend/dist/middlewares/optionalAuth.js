import jwt from "jsonwebtoken";
// Attaches req.user if a valid token is present. NEVER blocks the request —
// missing, malformed, or expired tokens all just fall through as a guest.
// Use this only on routes that must work for both logged-in and anonymous users.
export const optionalAuth = (req, res, next) => {
    try {
        const token = req.cookies?.token;
        if (!token) {
            return next();
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (error) {
        // Invalid/expired token — proceed as guest instead of erroring
        next();
    }
};
//# sourceMappingURL=optionalAuth.js.map