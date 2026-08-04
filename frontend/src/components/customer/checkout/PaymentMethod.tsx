"use client";

// Brand palette: Ink Navy #1B2A41 · Canvas Cream #F5EEDE · Surface Cream #FBF8F1
// Marigold Gold #C6941E (buttons/highlights, "this is selected" state)

interface UnavailableMethods {
    COD?: boolean;
    ONLINE?: boolean;
}

interface PaymentMethodProps {
    value: "ONLINE" | "COD" | null;
    onChange: (value: "ONLINE" | "COD") => void;
    isDisabled: boolean;
    // Marks a method as not serviceable for the current address (e.g. COD
    // unsupported by every courier to this pincode) — greys it out and blocks selection.
    unavailableMethods?: UnavailableMethods;
    // Shipping charge for each method — shown right on the card so the user
    // can compare before picking. null/undefined while not yet calculated.
    codShippingCharge?: number | null;
    onlineShippingCharge?: number | null;
}

function ShippingHint({
    isUnavailable,
    charge,
}: {
    isUnavailable: boolean;
    charge?: number | null;
}) {
    if (isUnavailable) return null;
    if (charge == null) return null; // not calculated yet — subtitle text covers this state
    return (
        <p className="text-xs font-bold text-[#1B2A41] mt-1">
            + ₹{charge.toLocaleString("en-IN")} shipping
        </p>
    );
}

export default function PaymentMethod({
    value,
    onChange,
    isDisabled,
    unavailableMethods = {},
    codShippingCharge,
    onlineShippingCharge,
}: PaymentMethodProps) {
    const isOnlineUnavailable = Boolean(unavailableMethods.ONLINE);
    const isCodUnavailable = Boolean(unavailableMethods.COD);

    return (
        <div className="bg-[#FBF8F1] rounded-3xl border border-[#1B2A41]/10 p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-[#1B2A41] mb-6">Payment Method</h2>

            <div className="grid md:grid-cols-2 gap-4">
                <button
                    type="button"
                    disabled={isDisabled || isOnlineUnavailable}
                    onClick={() => onChange("ONLINE")}
                    className={`
                        rounded-2xl
                        p-5
                        text-left
                        transition-all
                        border-2
                        ${isDisabled || isOnlineUnavailable ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
                        ${value === "ONLINE" ? "border-[#C6941E] bg-[#C6941E]/10" : "border-[#1B2A41]/15"}
                    `}
                >
                    <h3 className="font-bold text-[#1B2A41]">Online Payment</h3>
                    <p className="text-sm text-[#1B2A41]/60 mt-2">
                        {isOnlineUnavailable ? "Not available for this address" : "Razorpay / UPI / Cards"}
                    </p>
                    <ShippingHint isUnavailable={isOnlineUnavailable} charge={onlineShippingCharge} />
                </button>

                <button
                    type="button"
                    disabled={isDisabled || isCodUnavailable}
                    onClick={() => onChange("COD")}
                    className={`
                        rounded-2xl
                        p-5
                        text-left
                        transition-all
                        border-2
                        ${isDisabled || isCodUnavailable ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
                        ${value === "COD" ? "border-[#C6941E] bg-[#C6941E]/10" : "border-[#1B2A41]/15"}
                    `}
                >
                    <h3 className="font-bold text-[#1B2A41]">Cash On Delivery</h3>
                    <p className="text-sm text-[#1B2A41]/60 mt-2">
                        {isCodUnavailable ? "Not available for this address" : "Pay after delivery"}
                    </p>
                    <ShippingHint isUnavailable={isCodUnavailable} charge={codShippingCharge} />
                </button>
            </div>

            {isDisabled && (
                <p className="text-xs text-[#1B2A41]/40 font-medium mt-4">
                    Select a delivery address to choose a payment method
                </p>
            )}
        </div>
    );
}