// types/customer/address.type.ts

export interface Address {
    _id: string;
    userId: string;

    fullName: string;
    mobileNumber: string;

    pincode: string;
    district: string;
    state: string;

    addressLine1: string;
    addressLine2?: string;
    landmark?: string;

    isDefault: boolean;

    createdAt: string;
    updatedAt: string;
}

export interface CreateAddressPayload {
    fullName: string;
    mobileNumber: string;

    pincode: string;

    addressLine1: string;
    addressLine2?: string;
    landmark?: string;

    isDefault?: boolean;
}