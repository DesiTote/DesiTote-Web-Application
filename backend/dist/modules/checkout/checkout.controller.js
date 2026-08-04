import { createCheckoutSessionService, getCheckoutSessionService, updateCheckoutAddressService } from "./checkout.service.js";
import { ApiError } from "../../utils/ApiError.js";
export const createCheckoutSession = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const { selectedProductIds, buyNowItem } = req.body;
        const result = await createCheckoutSessionService(userId, selectedProductIds, buyNowItem);
        return res.status(201).json({
            success: true,
            message: "Checkout session created successfully",
            data: result,
        });
    }
    catch (err) {
        next(err);
    }
};
export const getCheckoutSession = async (req, res, next) => {
    try {
        const result = await getCheckoutSessionService(req.params.sessionId, req.user.userId);
        return res.status(200).json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
};
export const updateCheckoutAddressController = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const sessionId = req.params.sessionId;
        const { addressId } = req.body;
        if (!sessionId)
            throw new ApiError(400, "sessionId is required");
        if (!addressId)
            throw new ApiError(400, "addressId is required");
        const session = await updateCheckoutAddressService(sessionId, userId, addressId);
        return res
            .status(200)
            .json({ session, message: "Delivery address updated" });
    }
    catch (error) {
        next(error);
    }
};
//# sourceMappingURL=checkout.controller.js.map