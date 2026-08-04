import { ApiError } from "../../utils/ApiError.js";
import Subscription from "./subscription.model.js";

export const subscribeService = async (email: string) => {

    const exists = await Subscription.findOne({ email });

    if (exists) {

        throw new ApiError(404, "Already subscribed");

    }

    const subscription = await Subscription.create({ email });

    return subscription;

};