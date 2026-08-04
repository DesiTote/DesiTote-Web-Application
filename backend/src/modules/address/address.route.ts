// address.routes.ts

import { Router } from "express";

import {
    createAddress,
    getAddresses,
    deleteAddress,
    updateAddress,
} from "./address.controller.js";

import {
    isAuthenticated,
    restrictTo,
} from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { createAddressSchema } from "./address.validation.js";

const router = Router();

router.use(
    isAuthenticated,
    restrictTo("CUSTOMER")
);

router.get("/", getAddresses);

router.post("/", validate(createAddressSchema),createAddress);

router.patch("/:addressId",validate(createAddressSchema),updateAddress)

router.delete(
    "/:addressId",
    deleteAddress
);

export default router;