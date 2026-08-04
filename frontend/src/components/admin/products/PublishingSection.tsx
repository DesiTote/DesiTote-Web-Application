"use client";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import { Label } from "@/components/ui/label";

type Props = {
    register: any;
    errors?: any;
};

export default function PublishingSection({
    register,
}: Props) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    Publishing
                </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">

                {/* Featured */}

                <div className="flex items-center justify-between">

                    <div>
                        <Label>
                            Featured Product
                        </Label>

                        <p className="text-sm text-muted-foreground">
                            Show this product in featured sections
                        </p>
                    </div>

                    <input
                        type="checkbox"
                        {...register("isFeatured",{
                            valueAsBoolean:true,
                        })}
                        className="
                            h-5
                            w-5
                            cursor-pointer
                        "
                    />

                </div>

                {/* Published */}

                <div className="flex items-center justify-between">

                    <div>
                        <Label>
                            Published
                        </Label>

                        <p className="text-sm text-muted-foreground">
                            Product is visible to customers
                        </p>
                    </div>

                    <input
                        type="checkbox"
                        {...register("isPublished")}
                        className="
                            h-5
                            w-5
                            cursor-pointer
                        "
                    />

                </div>

                {/* Status */}

                <div>

                    <Label>
                        Status
                    </Label>

                    <select
                        {...register("status")}
                        className="
                            mt-2
                            w-full
                            rounded-md
                            border
                            p-2
                        "
                    >
                        <option value="ACTIVE">
                            Active
                        </option>

                        <option value="DRAFT">
                            Draft
                        </option>

                        <option value="ARCHIVED">
                            Archived
                        </option>
                    </select>

                </div>

            </CardContent>
        </Card>
    );
}