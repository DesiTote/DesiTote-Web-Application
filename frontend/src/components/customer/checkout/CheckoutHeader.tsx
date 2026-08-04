import { Lock } from "lucide-react";
export default function CheckoutHeader() {
  return (
    <div className="border-b w-11/12 mx-auto bg-white">

      {/* SAME WIDTH AS CHECKOUT PAGE */}

      <div className="max-w-375 mx-auto px-6 lg:px-10 py-6">

        <div className="flex items-center justify-between">

          <div className="flex items-center gap-8">

            <Step
              number="1"
              title="Checkout"
              active
            />

            <Line />

            <Step
              number="2"
              title="Payment"
            />

            <Line />

            <Step
              number="3"
              title="Confirmation"
            />

          </div>

          <div className="hidden md:flex items-center gap-2 text-green-600">

            <span><Lock /></span>

            <span className="font-medium">

              Secure Checkout

            </span>

          </div>

        </div>

      </div>

    </div>
  );
}

function Step({
    number,
    title,
    active = false,
}: {
    number: string;
    title: string;
    active?: boolean;
}) {
    return (
        <div className="flex items-center gap-3">

            <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold
        ${active
                        ? "bg-pink-500 text-white"
                        : "border text-slate-600"
                    }`}
            >
                {number}
            </div>

            <span className="font-semibold text-slate-900">
                {title}
            </span>

        </div>
    );
}

function Line() {
    return (
        <div className="hidden md:block w-20 border-t border-dashed" />
    );
}