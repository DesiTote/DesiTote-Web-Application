import CustomersTable from "@/components/admin/customer/CustomersTable";

export const metadata = {
    title: "Manage Customers",
};

export default function ManageCustomersPage() {
    return (
        <div className="space-y-6 p-6">
            <div>
                <h1 className="text-2xl font-bold">Customers</h1>
                <p className="text-sm text-muted-foreground">
                    View customer accounts and block accounts suspected of fraud or abuse.
                </p>
            </div>

            <CustomersTable />
        </div>
    );
}