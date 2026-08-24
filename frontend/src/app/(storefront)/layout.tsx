import AnnouncementBanner from "@/components/customer/home/AnnounceMentBanner";
import Navbar from "@/components/shared/Navbar";
import "../globals.css";

export default function StoreFrontLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <AnnouncementBanner />
            <Navbar />

            <main className="min-h-[calc(100vh-110px)] bg-[#F5EEDE]">
                {children}
            </main>
        </>
    );
}