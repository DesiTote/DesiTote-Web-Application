import { Router } from "express";
import {
    createCheckoutSession,
    getCheckoutSession,
    updateCheckoutAddressController,
    updateCheckoutPaymentMethodController,
} from "./checkout.controller.js";

import {
    isAuthenticated,
    restrictTo,
} from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { createCheckoutSessionSchema } from "./checkout.validation.js";


const router = Router();

// All checkout routes require customer auth
router.use(
    isAuthenticated,
    restrictTo("CUSTOMER")
);

// Create checkout session
router.post(
    "/session",
    validate(createCheckoutSessionSchema),
    createCheckoutSession
);

// Get checkout session details
router.get(
    "/session/:sessionId",
    getCheckoutSession
);


router.patch("/session/:sessionId/address", updateCheckoutAddressController);
router.patch("/session/:sessionId/payment-method", updateCheckoutPaymentMethodController);
export default router;