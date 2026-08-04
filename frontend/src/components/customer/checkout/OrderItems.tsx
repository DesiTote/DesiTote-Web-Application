import Image from "next/image";

export default function OrderItems() {
    return (
        <div className="bg-white rounded-3xl border p-6 shadow-sm">

            <h2 className="text-2xl font-bold mb-6">

                2. Order Items

            </h2>

            <div className="flex flex-col md:flex-row md:items-center gap-5">

                <Image
                    src="/images/Bag1.jpeg"
                    alt="product"
                    width={90}
                    height={90}
                    className="rounded-xl"
                />

                <div className="flex-1">

                    <h3 className="font-bold text-lg">
                        Minimal Tote
                    </h3>

                    <p className="text-slate-500">
                        Clean aesthetic
                    </p>

                </div>

                <div className="font-bold text-xl">

                    ₹299

                </div>

            </div>
        </div>
    );
}