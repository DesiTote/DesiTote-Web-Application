// address.service.ts
import axios from "axios";
import { Address } from "./address.model.js";
import { ApiError } from "../../utils/ApiError.js";
export const createAddressService = async (userId, data) => {
    const response = await axios.get(`https://api.postalpincode.in/pincode/${data.pincode}`);
    const result = response.data?.[0];
    if (!result ||
        result.Status !== "Success") {
        throw new ApiError(400, "Invalid pincode");
    }
    const postOffice = result.PostOffice?.[0];
    const district = postOffice.District;
    const state = postOffice.State;
    if (data.isDefault) {
        await Address.updateMany({ userId }, { isDefault: false });
    }
    const address = await Address.create({
        ...data,
        userId,
        district,
        state,
    });
    return address;
};
export const getAddressesService = async (userId) => {
    return Address.find({
        userId,
    }).sort({
        isDefault: -1,
        createdAt: -1,
    }).lean();
};
export const updateAddressService = async ({ addressId, userId, payload, }) => {
    // 1. Instantly clears any old default flags before handling the update
    if (payload.isDefault === true) {
        await Address.updateMany({ userId, _id: { $ne: addressId } }, { $set: { isDefault: false } });
    }
    const address = await Address.findOne({ _id: addressId, userId });
    if (!address)
        throw new ApiError(404, "Address not found");
    Object.assign(address, payload);
    await address.save();
    return address;
};
export const deleteAddressService = async (userId, addressId) => {
    const address = await Address.findOneAndDelete({
        _id: addressId,
        userId,
    });
    if (!address) {
        throw new ApiError(404, "Address not found");
    }
};
//# sourceMappingURL=address.service.js.map