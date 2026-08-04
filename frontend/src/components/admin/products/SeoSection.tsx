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
};

export default function SeoSection({
    register,
}: Props) {

    return (

        <Card>

            <CardHeader>

                <CardTitle>
                    SEO Settings
                </CardTitle>

            </CardHeader>

            <CardContent className="space-y-5">

                <div>

                    <Label>
                        SEO Title
                    </Label>

                    <input
                        {...register(
                            "seoTitle"
                        )}
                        className="
                            mt-2
                            w-full
                            rounded-md
                            border
                            p-3
                        "
                    />

                </div>

                <div>

                    <Label>
                        SEO Description
                    </Label>

                    <textarea
                        rows={4}
                        {...register(
                            "seoDescription"
                        )}
                        className="
                            mt-2
                            w-full
                            rounded-md
                            border
                            p-3
                        "
                    />

                </div>

                <div>

                    <Label>
                        SEO Keywords
                    </Label>

                    <input
                        {...register(
                            "seoKeywords"
                        )}
                        placeholder="tote bag,desitotes,eco bag"
                        className="
                            mt-2
                            w-full
                            rounded-md
                            border
                            p-3
                        "
                    />

                </div>

            </CardContent>

        </Card>

    );
}