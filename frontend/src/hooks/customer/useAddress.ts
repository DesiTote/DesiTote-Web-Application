// hooks/customer/useAddress.ts

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { toast } from "sonner";

import { addressService } from "@/services/customer/address.service";

import { QUERY_KEYS } from "@/constants/customer/queryKeys";
import { Address } from "@/types/customer/address.type";

export const useAddresses = () => {
    return useQuery({
        queryKey: QUERY_KEYS.ADDRESSES,
        queryFn: addressService.getAddresses,
        staleTime: 1000 * 60 * 5,
    });
};

export const useCreateAddress = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: addressService.createAddress,

        onSuccess: (response) => {
            const newAddress = response.data;

            queryClient.setQueryData(
                QUERY_KEYS.ADDRESSES,
                (oldData: any) => {
                    // 1. Safe fallback if there is no existing cache data
                    if (!oldData) {
                        return {
                            data: [newAddress],
                        };
                    }

                    // 2. Prepare the existing list
                    let existingAddresses = oldData.data;

                    // 3. If the new address is marked as default, turn off default for everyone else
                    if (newAddress.isDefault) {
                        existingAddresses = existingAddresses.map((address: Address) => ({
                            ...address,
                            isDefault: false,
                        }));
                    }

                    // 4. Return the combined dataset with the new address at the top
                    return {
                        ...oldData,
                        data: [newAddress, ...existingAddresses],
                    };
                }
            );

            toast.success("Address added successfully");
        },

        onError: (error: any) => {
            toast.error(
                error?.response?.data?.message || "Failed to add address"
            );
        },
    });
};
export const useUpdateAddress = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: addressService.updateAddress,

        onSuccess: (response) => {
            const updatedAddress = response.data; // The fresh address returned from the server

            // Manually modify the React Query cache for the addresses list
            queryClient.setQueryData(
                QUERY_KEYS.ADDRESSES,
                (oldData: any) => {
                    if (!oldData) return oldData;

                    return {
                        ...oldData,
                        data: oldData.data.map((address: Address) => {
                            // 1. If this is the address we just edited, swap it with the server's response
                            if (address._id === updatedAddress._id) {
                                return updatedAddress;
                            }

                            // 2. If our updated address is the new default, strip default status from everyone else
                            if (updatedAddress.isDefault) {
                                return {
                                    ...address,
                                    isDefault: false,
                                };
                            }

                            // 3. Leave all other addresses exactly as they were
                            return address;
                        }),
                    };
                }
            );

            toast.success("Address updated successfully");
        },

        onError: (error: any) => {
            toast.error(
                error?.response?.data?.message || "Failed to update address"
            );
        },
    });
};

export const useDeleteAddress = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: addressService.deleteAddress,

        onSuccess: (_, deletedAddressId) => {
            queryClient.setQueryData(
                QUERY_KEYS.ADDRESSES,
                (oldData: any) => {
                    if (!oldData) return oldData;

                    // Filter out the deleted address so the local array length drops accurately
                    return {
                        ...oldData,
                        data: oldData.data.filter(
                            (address: Address) => address._id !== deletedAddressId
                        ),
                    };
                }
            );

            toast.success("Address deleted successfully");
        },
        onError: (error: any) => {
            toast.error(error?.message || "Failed to delete address");
        }
    });
};