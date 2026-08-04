import mongoose from "mongoose";
import { ApiError } from "./ApiError.js";
export const validateObjectId = (id, fieldName = "Id") => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, `Invalid ${fieldName}`);
    }
};
//# sourceMappingURL=mongoIDValidator.js.map