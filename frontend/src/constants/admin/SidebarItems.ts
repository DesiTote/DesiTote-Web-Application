import { LayoutDashboard, Package, FolderTree, ShoppingCart, Users, TicketPercent, MessageSquare, BarChart3, Settings, UserCog, CircleUserRound } from "lucide-react";

export const sidebarItems = [
    {
        label: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        label: "Products",
        href: "/manage-products",
        icon: Package,
    },
    {
        label: "Orders",
        href: "/manage-orders",
        icon: ShoppingCart,
    },
    {
        label: "Customers",
        href: "/manage-customers",
        icon: Users,
    },
    {
        label: "Analytics",
        href: "/analytics",
        icon: BarChart3,
    },
    {
        label: "Profile",
        href: "/my-profile",
        icon: CircleUserRound,
    },
    {
        label: "Team Member",
        href: "/team-members",
        icon: UserCog,
    },
];