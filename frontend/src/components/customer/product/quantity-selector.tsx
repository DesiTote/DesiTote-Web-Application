"use client";

import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";

interface QuantitySelectorProps {
    quantity: number;
    setQuantity: (value: number) => void;
    max: number;
}

export default function QuantitySelector({
    quantity,
    setQuantity,
    max,
}: QuantitySelectorProps) {
    return (
        <div className="flex items-center gap-4">

            <span className="font-medium">
                Quantity
            </span>

            <div className="flex items-center rounded-xl border">

                <Button
                    variant="ghost"
                    size="icon"
                    className="cursor-pointer rounded-r-none"
                    disabled={quantity <= 1}
                    onClick={() => setQuantity(quantity - 1)}
                >
                    <Minus className="h-4 w-4" />
                </Button>

                <span className="w-10 text-center font-semibold">
                    {quantity}
                </span>

                <Button
                    variant="ghost"
                    size="icon"
                    className="cursor-pointer rounded-l-none"
                    disabled={quantity >= max}
                    onClick={() => setQuantity(quantity + 1)}
                >
                    <Plus className="h-4 w-4" />
                </Button>

            </div>
        </div>
    );
}