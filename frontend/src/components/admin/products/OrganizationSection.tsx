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
    register:any;
    errors:any;
};

export default function OrganizationSection({
    register,
}:Props){

    return (

        <Card>

            <CardHeader>

                <CardTitle>
                    Organization
                </CardTitle>

            </CardHeader>

            <CardContent className="space-y-5">

                <div>

                    <Label>
                        Category
                    </Label>

                    <Input
                        {...register(
                            "category"
                        )}
                        placeholder="Tote Bags"
                    />

                </div>

                <div>

                    <Label className="p-4">
                        Product Type
                    </Label>

                    <Input
                        {...register(
                            "type"
                        )}
                        placeholder="Canvas Tote"
                    />

                </div>

                <div>

                    <Label>
                        Tags
                    </Label>

                    <Input
                        {...register(
                            "tags"
                        )}
                        placeholder="eco,minimal,premium"
                    />

                </div>

            </CardContent>

        </Card>

    );
}