import ChangePasswordTab from "@/components/admin/profile/ChangePasswordTab";
import ProfileInfoCard from "@/components/admin/profile/ProfileInfoCard";


export const metadata = {
    title: "My Profile",
};

export default function AdminProfilePage() {
    return (
        <div className="space-y-6 p-6">
            <div>
                <h1 className="text-2xl font-bold">My Profile</h1>
                <p className="text-sm text-muted-foreground">Manage your own account settings.</p>
            </div>

            <div className="max-w-2xl space-y-6">
                <ProfileInfoCard />
                <ChangePasswordTab />
            </div>
        </div>
    );
}