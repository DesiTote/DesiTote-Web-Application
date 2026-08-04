// ─── hooks/useTeam.ts ─────────────────────────────────────────────
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    getTeamMembersApi,
    createTeamMemberApi,
    resetTeamMemberPasswordApi,
} from "@/services/admin/team.service";
import { toast } from "sonner"; // adjust to whatever toast library your project uses

export function useTeamMembers() {
    return useQuery({
        queryKey: ["admin", "team"],
        queryFn: getTeamMembersApi,
    });
}

export function useCreateTeamMember() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createTeamMemberApi,
        onSuccess: () => {
            toast.success("Team member added");
            queryClient.invalidateQueries({ queryKey: ["admin", "team"] });
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.message || "Couldn't add team member");
        },
    });
}

export function useResetTeamMemberPassword() {
    return useMutation({
        mutationFn: ({ userId, password }: { userId: string; password: string }) =>
            resetTeamMemberPasswordApi(userId, password),
        onSuccess: () => {
            toast.success("Password reset — share it with them securely");
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.message || "Couldn't reset password");
        },
    });
}