"use client";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
    register: any;
    errors: any;
};

export default function InventorySection({
    register,
    errors,
}: Props) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    Inventory
                </CardTitle>
            </CardHeader>

            <CardContent className="space-y-5">

                <div>

                    <Label>
                        Stock
                    </Label>

                    <Input
                        type="number"
                        className="mt-2"
                        {...register(
                            "stock",
                            {
                                valueAsNumber: true,
                            }
                        )}
                    />

                    {errors.stock && (
                        <p className="text-red-500 text-sm mt-1">
                            {errors.stock.message}
                        </p>
                    )}

                </div>

                <div>

                    <Label>
                        SKU
                    </Label>

                    <Input
                        className="mt-2"
                        placeholder="TOTEBAG-BLK-001"
                        {...register("sku")}
                    />

                    {errors.sku && (
                        <p className="text-red-500 text-sm mt-1">
                            {errors.sku.message}
                        </p>
                    )}

                </div>

            </CardContent>
        </Card>
    );
}