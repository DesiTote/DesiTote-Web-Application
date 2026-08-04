import { IUser } from "../modules/auth/auth.model";
import { CheckoutSession } from "./checkout.ts";

declare global {
    namespace Express {
        interface Request {
            user?: IUser;
            checkoutSession?:CheckoutSession;
        }
    }
}