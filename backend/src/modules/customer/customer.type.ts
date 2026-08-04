import { UserRole } from "../auth/auth.model.js";

export interface AdminCustomerListQuery {
    page?: number;
    limit?: number;
    search?: string;          // fullName / email
    role?: UserRole;
    blocked?: boolean;        // filter to only blocked / only active accounts
}

export interface AdminCustomerListItem {
    _id: string;
    fullName: string;
    email: string;
    role: UserRole;
    emailVerified: boolean;
    mobileVerified: boolean;
    isAccountBlocked: boolean;
    createdAt: Date;
    totalOrders: number;
    totalSpent: number;
}