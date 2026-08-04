import { Router } from "express";
import { subscribe } from "./subscription.controller.js";

import { subscribeSchema } from "./subscription.validation.js";
import { validate } from "../../middlewares/validate.middleware.js";

const router = Router();

router.post(
    "/",
    validate(subscribeSchema),
    subscribe
);

export default router;