// "use client";

// import {
//     useMutation,
//     useQuery,
//     useQueryClient,
// } from "@tanstack/react-query";

// import {
//     toggleWishlistService,
//     getWishlistService,
//     removeWishlistService,
// } from "@/services/customer/wishlist.api";

// import { toast } from "sonner";

// /* ───────────────── GET ───────────────── */

// export const useGetWishlist = () => {

//     return useQuery({
//         queryKey: ["wishlist"],

//         queryFn: async () => {

//             const response =
//                 await getWishlistService();

//             return response.data;
//         },

//         staleTime: 1000 * 60 * 5,
//     });
// };

// /* ───────────────── TOGGLE ───────────────── */

// export const useToggleWishlist = () => {

//     const queryClient =
//         useQueryClient();

//     return useMutation({

//         mutationFn: toggleWishlistService,

//         onMutate: async (
//             variables
//         ) => {

//             await queryClient.cancelQueries({
//                 queryKey: ["wishlist"],
//             });

//             const previousWishlist =
//                 queryClient.getQueryData(
//                     ["wishlist"]
//                 );

//             queryClient.setQueryData(
//                 ["wishlist"],
//                 (old: any) => {

//                     if (!old) return old;

//                     const exists =
//                         old.some(
//                             (item: any) =>
//                                 item.productId?._id ===
//                                 variables.productId
//                         );

//                     if (exists) {

//                         return old.filter(
//                             (item: any) =>
//                                 item.productId?._id !==
//                                 variables.productId
//                         );
//                     }

//                     return old;
//                 }
//             );

//             return { previousWishlist };
//         },

//         onSuccess: (data) => {

//             toast.success(
//                 data.message
//             );
//         },

//         onError: (
//             error: any,
//             _variables,
//             context
//         ) => {

//             if (
//                 context?.previousWishlist
//             ) {
//                 queryClient.setQueryData(
//                     ["wishlist"],
//                     context.previousWishlist
//                 );
//             }

//             toast.error(
//                 error?.response?.data
//                     ?.message ||
//                 "Wishlist action failed"
//             );
//         },

//         onSettled: () => {

//             queryClient.invalidateQueries({
//                 queryKey: ["wishlist"],
//             });
//         },
//     });
// };

// /* ───────────────── REMOVE ───────────────── */

// export const useRemoveWishlist = () => {

//     const queryClient =
//         useQueryClient();

//     return useMutation({

//         mutationFn:
//             removeWishlistService,

//         onSuccess: (data) => {

//             toast.success(
//                 data.message
//             );

//             queryClient.invalidateQueries({
//                 queryKey: ["wishlist"],
//             });
//         },

//         onError: (error: any) => {

//             toast.error(
//                 error?.response?.data
//                     ?.message ||
//                 "Failed removing item"
//             );
//         },
//     });
// };


"use client";

import {
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";

import {
    toggleWishlistService,
    getWishlistService,
    removeWishlistService,
} from "@/services/customer/wishlist.api";

import { toast } from "sonner";
import { getCookie } from "@/utils/cookie";

/* ───────────────── GET ───────────────── */

export const useGetWishlist = () => {
    const hasSessionHint = getCookie("isLoggedIn") === "true";

    return useQuery({
        queryKey: ["wishlist"],
        queryFn: async () => {
            const response = await getWishlistService();
            return response.data; // Expecting an array of items
        },
        enabled: hasSessionHint,
        retry: false,
        staleTime: 1000 * 60 * 5,
    });
};

/* ───────────────── TOGGLE (ADD/REMOVE) ───────────────── */

interface ToggleVariables {
    productId: string;
    // You can optionally pass the full product data here from the UI 
    // if you want to populate titles/images optimistically!
    productDetails?: any; 
}

export const useToggleWishlist = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (variables: ToggleVariables) => toggleWishlistService(variables),

        onMutate: async (variables) => {
            // Cancel outgoing refetches so they don't overwrite our optimistic update
            await queryClient.cancelQueries({ queryKey: ["wishlist"] });

            // Snapshot the previous value
            const previousWishlist = queryClient.getQueryData<any[]>(["wishlist"]);

            // Optimistically update the cache
            queryClient.setQueryData(["wishlist"], (old: any[] | undefined) => {
                if (!old) return [{ productId: { _id: variables.productId, ...variables.productDetails } }];

                const exists = old.some(
                    (item: any) => item.productId?._id === variables.productId
                );

                if (exists) {
                    // Remove item if it exists
                    return old.filter((item: any) => item.productId?._id !== variables.productId);
                } else {
                    // Add item if it doesn't exist (Match your backend's schema structure)
                    const newItem = {
                        _id: `temp-${Date.now()}`, // Temporary ID
                        productId: {
                            _id: variables.productId,
                            ...variables.productDetails
                        }
                    };
                    return [...old, newItem];
                }
            });

            // Return context object with the snapshotted value
            return { previousWishlist };
        },

        onSuccess: (data) => {
            toast.success(data.message || "Wishlist updated");
        },

        onError: (error: any, _variables, context) => {
            // Rollback to the previous state if mutation fails
            if (context?.previousWishlist) {
                queryClient.setQueryData(["wishlist"], context.previousWishlist);
            }
            toast.error(error?.response?.data?.message || "Wishlist action failed");
        },

        onSettled: () => {
            // Always refetch after success or error to sync with server truth
            queryClient.invalidateQueries({ queryKey: ["wishlist"] });
        },
    });
};

/* ───────────────── REMOVE ───────────────── */

interface RemoveVariables {
    productId: string;
}

export const useRemoveWishlist = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (variables: string | { productId: string }) => {
            const productId =
                typeof variables === "string" ? variables : variables.productId;
            return removeWishlistService(productId);
        },

        onMutate: async (variables) => {
            await queryClient.cancelQueries({ queryKey: ["wishlist"] });
            const previousWishlist = queryClient.getQueryData<any[]>(["wishlist"]);

            const targetId =
                typeof variables === "string" ? variables : variables.productId;

            queryClient.setQueryData(["wishlist"], (old: any[] | undefined) => {
                if (!old) return [];
                return old.filter((item: any) => item.productId?._id !== targetId);
            });

            return { previousWishlist };
        },

        onSuccess: (data) => {
            toast.success(data.message || "Item removed from wishlist");
        },

        onError: (error: any, _variables, context) => {
            if (context?.previousWishlist) {
                queryClient.setQueryData(["wishlist"], context.previousWishlist);
            }
            toast.error(error?.response?.data?.message || "Failed removing item");
        },

        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["wishlist"] });
        },
    });
};