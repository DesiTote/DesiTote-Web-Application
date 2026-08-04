import { useMutation } from "@tanstack/react-query";
import { subscribe } from "@/services/customer/subscription.service";

export const useSubscribe = () => {

    return useMutation({

        mutationFn: subscribe

    });

}