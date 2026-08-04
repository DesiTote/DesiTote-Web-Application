// services/customer/address.service.ts

import { api } from "@/lib/axios";

import {
    Address,
    CreateAddressPayload,
} from "@/types/customer/address.type";

export const addressService = {
    getAddresses: async () => {
        const response = await api.get<{
            success: boolean;
            data: Address[];
        }>("/address");

        return response.data;
    },

    createAddress: async (
        payload: CreateAddressPayload
    ) => {
        const response = await api.post<{
            success: boolean;
            data: Address;
        }>("/address", payload);

        return response.data;
    },

    // address.service.ts

    updateAddress: async ({
        addressId,
        data,
    }: {
        addressId: string;
        data: CreateAddressPayload;
    }) => {
        const response =
            await api.patch(
                `/address/${addressId}`,
                data
            );

        return response.data;
    },

    deleteAddress: async (
        addressId: string
    ) => {
        const response = await api.delete(
            `/address/${addressId}`
        );

        return response.data;
    },
};