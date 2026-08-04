// address.controller.ts
import { createAddressService, getAddressesService, deleteAddressService, updateAddressService, } from "./address.service.js";
export const createAddress = async (req, res, next) => {
    try {
        const address = await createAddressService(req.user.userId, req.body);
        res.status(201).json({
            success: true,
            data: address,
        });
    }
    catch (err) {
        next(err);
    }
};
export const getAddresses = async (req, res, next) => {
    try {
        const addresses = await getAddressesService(req.user.userId);
        res.status(200).json({
            success: true,
            data: addresses,
        });
    }
    catch (err) {
        next(err);
    }
};
// address.controller.ts
export const updateAddress = async (req, res, next) => {
    try {
        const address = await updateAddressService({
            addressId: req.params.addressId,
            userId: req.user.userId,
            payload: req.body,
        });
        res.status(200).json({
            success: true,
            message: "Address updated successfully",
            data: address,
        });
    }
    catch (err) {
        next(err);
    }
};
export const deleteAddress = async (req, res, next) => {
    try {
        await deleteAddressService(req.user.userId, req.params.addressId);
        res.status(200).json({
            success: true,
            message: "Address deleted successfully",
        });
    }
    catch (err) {
        next(err);
    }
};
//# sourceMappingURL=address.controller.js.map