import DashboardStats from "@/components/admin/dashboard/DashboardStats";
import OrderStatusChart from "@/components/admin/dashboard/OrderStatusChart";
import SalesOverview from "@/components/admin/dashboard/SalesOverView";

export default function DashboardPage() {
  return (
    <div className="space-y-6 p-4 md:p-6">

      {/* Top Stats */}
      <h4>Welcome back 👋</h4>
      <DashboardStats />

      {/* Graph Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        <SalesOverview />
        <OrderStatusChart />
      </div>

    </div>
  );
}