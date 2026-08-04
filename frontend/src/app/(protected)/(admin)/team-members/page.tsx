import AddTeamMemberForm from "@/components/admin/team/Addteammemberform";
import TeamMembersList from "@/components/admin/team/Teammemberslist";


export const metadata = {
    title: "Manage Team",
};

export default function ManageTeamPage() {
    return (
        <div className="space-y-6 p-6">
            <div>
                <h1 className="text-2xl font-bold">Team</h1>
                <p className="text-sm text-muted-foreground">
                    Add team members and manage their access to this dashboard.
                </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <TeamMembersList />
                <AddTeamMemberForm />
            </div>
        </div>
    );
}