// ─── types/customer.types.ts ────────────────────────────────────

export type UserRole = "ADMIN" | "CUSTOMER";

export interface AdminCustomerListItem {
    _id: string;
    fullName: string;
    email: string;
    role: UserRole;
    emailVerified: boolean;
    mobileVerified: boolean;
    isAccountBlocked: boolean;
    createdAt: string;
    totalOrders: number;
    totalSpent: number;
}

export interface AdminCustomerListResponse {
    customers: AdminCustomerListItem[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface AdminCustomerListParams {
    page?: number;
    limit?: number;
    search?: string;
    role?: UserRole;
    blocked?: boolean;
}