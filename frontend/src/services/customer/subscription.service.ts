import { api } from "@/lib/axios";
import { SubscriptionFormData } from "@/schemas/customer/subscription.schema";

 

export const subscribe=async(data:SubscriptionFormData)=>{

    const response=await api.post(
        "/subscriptions",
        data
    );

    return response.data;

}