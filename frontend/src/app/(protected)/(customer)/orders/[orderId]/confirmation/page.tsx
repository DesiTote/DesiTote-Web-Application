import OrderConfirmationClient from "./OrderConfirmationClient";

interface PageProps {
    params: Promise<{ orderId: string }>;
}

export default async function OrderConfirmationPage({ params }: PageProps) {
    // 1. Next.js requires you to await params
    const { orderId } = await params;

    // 2. Pass it down cleanly
    return <OrderConfirmationClient orderId={orderId} />;
}