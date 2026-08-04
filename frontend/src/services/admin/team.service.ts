// ─── services/team.service.ts ────────────────────────────────────
import { api } from "@/lib/axios"; // adjust to your configured axios instance

export interface TeamMemberListItem {
    _id: string;
    fullName: string;
    email: string;
    mobileNumber: string;
    emailVerified: boolean;
    mobileVerified: boolean;
    isAccountBlocked: boolean;
    addedBy: { _id: string; fullName: string } | null;
}

interface ApiResponse<T> {
    success: boolean;
    data: T;
}

const BASE_URL = "/admin/team";

export async function getTeamMembersApi(): Promise<TeamMemberListItem[]> {
    const res = await api.get<ApiResponse<TeamMemberListItem[]>>(BASE_URL);
    return res.data.data;
}

export async function createTeamMemberApi(payload: {
    fullName: string;
    email: string;
    password: string;
    mobileNumber: string;
}): Promise<TeamMemberListItem> {
    const res = await api.post<ApiResponse<TeamMemberListItem>>(BASE_URL, payload);
    return res.data.data;
}

export async function resetTeamMemberPasswordApi(
    userId: string,
    password: string
): Promise<{ _id: string; email: string }> {
    const res = await api.patch<ApiResponse<{ _id: string; email: string }>>(
        `${BASE_URL}/${userId}/reset-password`,
        { password }
    );
    return res.data.data;
}