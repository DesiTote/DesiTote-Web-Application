import mongoose from "mongoose";
import { User, IUser, UserRole } from "../auth/auth.model.js";
import { Order } from "../order/order.model.js";
import { REVENUE_EXCLUDED_STATUSES } from "../admin dashboard/dashboard.constant.js"; 
import { AdminCustomerListItem, AdminCustomerListQuery } from "./customer.type.js";
import { validateObjectId } from "../../utils/mongoIDValidator.js";
import { ApiError } from "../../utils/ApiError.js";


function buildFilter(query: AdminCustomerListQuery): mongoose.QueryFilter<IUser> {
    const filter: mongoose.QueryFilter<IUser> = {};

    if (query.role) {
        filter.role = query.role;
    }

    if (query.blocked !== undefined) {
        filter.isAccountBlocked = query.blocked;
    }

    if (query.search) {
        const regex = new RegExp(query.search.trim(), "i");
        filter.$or = [{ fullName: regex }, { email: regex }];
    }

    return filter;
}

export async function fetchAdminCustomerList(query: AdminCustomerListQuery) {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(100, Math.max(1, query.limit ?? 10));
    const skip = (page - 1) * limit;

    const filter = buildFilter(query);

    const [users, total] = await Promise.all([
        User.find(filter)
            .select("fullName email role emailVerified mobileVerified isAccountBlocked createdAt")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        User.countDocuments(filter),
    ]);

    const userIds = users.map((u) => u._id);

    const orderStats = await Order.aggregate([
        { $match: { userId: { $in: userIds } } },
        {
            $group: {
                _id: "$userId",
                totalOrders: { $sum: 1 },
                totalSpent: {
                    $sum: {
                        $cond: [{ $in: ["$status", REVENUE_EXCLUDED_STATUSES] }, 0, "$grandTotal"],
                    },
                },
            },
        },
    ]);

    const statsByUserId = new Map(orderStats.map((s) => [s._id.toString(), s]));

    const customers: AdminCustomerListItem[] = users.map((u: any) => {
        const stats = statsByUserId.get(u._id.toString());
        return {
            _id: u._id.toString(),
            fullName: u.fullName,
            email: u.email,
            role: u.role,
            emailVerified: u.emailVerified,
            mobileVerified: u.mobileVerified,
            isAccountBlocked: u.isAccountBlocked,
            createdAt: u.createdAt,
            totalOrders: stats?.totalOrders ?? 0,
            totalSpent: stats?.totalSpent ?? 0,
        };
    });

    return {
        customers,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.max(1, Math.ceil(total / limit)),
        },
    };
}

/* ────────────────────────────────────────────────────────────
 * Block / unblock a customer account.
 * ──────────────────────────────────────────────────────────── */
export async function setCustomerBlockedStatus(userId: string, blocked: boolean) {
   validateObjectId(userId,"userId");

    const existing = await User.findById(userId).select("role");
    if (!existing) {
        throw new ApiError(404, "Customer not found");
    }

    // Never allow an admin account to be blocked through this endpoint.
    if (existing.role === UserRole.ADMIN) {
        throw new ApiError(403, "Cannot block an admin account");
    }

    const user = await User.findByIdAndUpdate(
        userId,
        { isAccountBlocked: blocked },
        { new: true }
    ).select("fullName email role isAccountBlocked");

    return user!;
}