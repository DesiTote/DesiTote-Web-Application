import OrdersTable from "@/components/admin/order/OrderTable";

export const metadata = {
    title: "Manage Orders",
};

export default function ManageOrdersPage() {
    return (
        <div className="space-y-6 p-6">
            <div>
                <h1 className="text-2xl font-bold">Manage Orders</h1>
                <p className="text-sm text-muted-foreground">
                    View and track all customer orders. Shipping is handled via Shiprocket.
                </p>
            </div>

            <OrdersTable />
        </div>
    );
}