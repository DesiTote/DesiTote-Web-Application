import PublicRoute from "@/components/guards/PublicRoute";
import "../globals.css"
export default function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <PublicRoute>
                {children}
            </PublicRoute>
        </div>
    );
}