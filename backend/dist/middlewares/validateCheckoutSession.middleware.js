import { getRedis } from "../config/redis.js";
import { ApiError } from "../utils/ApiError.js";
export const validateCheckoutSession = async (req, res, next) => {
    try {
        const sessionId = req.params.sessionId;
        if (!sessionId) {
            throw new ApiError(400, "Session id is required");
        }
        const redis = getRedis();
        const session = await redis.get(`checkout:${sessionId}`);
        if (!session) {
            throw new ApiError(404, "Checkout session expired or not found");
        }
        if (session.userId !== req.user.userId) {
            throw new ApiError(403, "Unauthorized checkout session");
        }
        // attach session for controller
        req.checkoutSession = session;
        next();
    }
    catch (err) {
        next(err);
    }
};
//# sourceMappingURL=validateCheckoutSession.middleware.js.map