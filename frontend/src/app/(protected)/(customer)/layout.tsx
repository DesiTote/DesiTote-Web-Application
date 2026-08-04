import CustomerRoute from "@/components/guards/CustomerRoute";
import Navbar from "@/components/shared/Navbar";
import "../../globals.css";

export default function CustomerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <CustomerRoute>
            <div className="min-h-screen flex flex-col bg-[#F5EEDE]">
                <Navbar />

                <main className="flex-1">
                    {children}
                </main>
            </div>
        </CustomerRoute>
    );
}