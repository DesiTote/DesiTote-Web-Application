import BestsellersSection from "@/components/customer/home/BestSeller";
import Footer from "@/components/customer/home/Footer";
import Hero from "@/components/customer/home/Hero";
import OurStory from "@/components/customer/home/OurCraft";

export default function Home() {
    return (
        <div className="flex flex-col flex-1 items-center justify-center font-sans dark:bg-black">
            <Hero />
            <BestsellersSection />
            <OurStory />
            <Footer />
        </div>
    );
}
