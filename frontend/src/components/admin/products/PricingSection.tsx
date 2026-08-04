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

export default function PricingSection({
    register,
    errors,
}: Props) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    Pricing & Logistics
                </CardTitle>
            </CardHeader>

            <CardContent className="space-y-5">

                {/* Pricing */}

                <div>
                    <Label>Price (₹)</Label>

                    <Input
                        className="mt-2"
                        type="number"
                        placeholder="499"
                        {...register("price", {
                            valueAsNumber: true,
                        })}
                    />

                    {errors.price && (
                        <p className="text-red-500 text-sm mt-1">
                            {errors.price.message}
                        </p>
                    )}
                </div>

                <div>
                    <Label>Cost price (₹)</Label>

                    <Input
                        type="number"
                        className="mt-2"
                        placeholder="499"
                        {...register("costPrice", {
                            valueAsNumber: true,
                        })}
                    />

                    {errors.costPrice && (
                        <p className="text-red-500 text-sm mt-1">
                            {errors.costPrice.message}
                        </p>
                    )}
                </div>

                <div>
                    <Label>
                        Discount Price (₹)
                    </Label>

                    <Input
                        className="mt-2"
                        type="number"
                        placeholder="399"
                        {...register(
                            "discountPrice",
                            {
                                valueAsNumber: true,
                            }
                        )}
                    />

                    {errors.discountPrice && (
                        <p className="text-red-500 text-sm mt-1">
                            {
                                errors
                                    .discountPrice
                                    .message
                            }
                        </p>
                    )}
                </div>

                {/* Weight */}

                <div>
                    <Label>
                        Weight (kg)
                    </Label>

                    <Input
                        className="mt-2"
                        type="number"
                        step="any"
                        placeholder="0.5"
                        {...register(
                            "weight",
                            {
                                valueAsNumber: true,
                            }
                        )}
                    />

                    {errors.weight && (
                        <p className="text-red-500 text-sm mt-1">
                            {
                                errors.weight
                                    .message
                            }
                        </p>
                    )}
                </div>

                <div>
                    <Label>GST Percentage</Label>

                    <Input
                        type="number"
                        className="mt-2"
                        placeholder="18"
                        {...register("gstPercentage", {
                            valueAsNumber: true,
                        })}
                    />

                    {errors.gstPercentage && (
                        <p className="text-red-500 text-sm mt-1">
                            {errors.gstPercentage.message}
                        </p>
                    )}
                </div>

                {/* Dimensions */}

                <div className="space-y-3">

                    <Label>
                        Product Dimensions (cm)
                    </Label>

                    <div className="grid grid-cols-3 gap-3">

                        <div>
                            <Input
                                className="mt-2"
                                type="number"
                                placeholder="Length"
                                {...register(
                                    "dimensions.length",
                                    {
                                        valueAsNumber: true,
                                    }
                                )}
                            />

                            {errors
                                ?.dimensions
                                ?.length && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {
                                            errors
                                                .dimensions
                                                .length
                                                .message
                                        }
                                    </p>
                                )}
                        </div>

                        <div>
                            <Input
                                className="mt-2"
                                type="number"
                                placeholder="Breadth"
                                {...register(
                                    "dimensions.breadth",
                                    {
                                        valueAsNumber: true,
                                    }
                                )}
                            />

                            {errors
                                ?.dimensions
                                ?.breadth && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {
                                            errors
                                                .dimensions
                                                .breadth
                                                .message
                                        }
                                    </p>
                                )}
                        </div>

                        <div>
                            <Input
                                className="mt-2"
                                type="number"
                                placeholder="Height"
                                {...register(
                                    "dimensions.height",
                                    {
                                        valueAsNumber: true,
                                    }
                                )}
                            />

                            {errors
                                ?.dimensions
                                ?.height && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {
                                            errors
                                                .dimensions
                                                .height
                                                .message
                                        }
                                    </p>
                                )}
                        </div>

                    </div>

                </div>

            </CardContent>
        </Card>
    );
}