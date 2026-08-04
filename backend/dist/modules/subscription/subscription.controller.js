import { subscribeService } from "./subscription.service.js";
export const subscribe = async (req, res, next) => {
    try {
        const data = await subscribeService(req.body.email);
        res.status(201).json({
            success: true,
            message: "Subscribed successfully",
            data
        });
    }
    catch (error) {
        next(error);
    }
};
//# sourceMappingURL=subscription.controller.js.map