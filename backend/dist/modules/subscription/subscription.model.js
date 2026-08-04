import { Schema, model } from "mongoose";
const subscriptionSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        index: true,
        trim: true
    }
}, {
    timestamps: true
});
export default model("Subscription", subscriptionSchema);
//# sourceMappingURL=subscription.model.js.map