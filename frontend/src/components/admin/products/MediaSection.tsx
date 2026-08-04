"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Upload, Trash2, Star } from "lucide-react";
import { UseFormSetValue, UseFormWatch, FieldErrors } from "react-hook-form";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProductFormValues } from "@/schemas/admin/product.schema";

type Props = {
    setValue: UseFormSetValue<ProductFormValues>;
    watch: UseFormWatch<ProductFormValues>;
    errors: FieldErrors<ProductFormValues>;
};

export default function MediaSection({ setValue, watch, errors }: Props) {
    const [previews, setPreviews] = useState<string[]>([]);

    // 1. Cast as an array of strings or File objects dynamically
    const files = (watch("images") as (File | string)[]) || [];
    const thumbnailIndex = watch("thumbnailIndex") || 0;

    // 2. Safely generate previews supporting both raw Files and remote DB strings
    useEffect(() => {
        if (!files || files.length === 0) {
            setPreviews([]);
            return;
        }

        // Track only generated object URLs so we can clean them up later
        const localCreatedUrls: string[] = [];

        const computedPreviews = files.map((file) => {
            if (file instanceof File) {
                const objectUrl = URL.createObjectURL(file);
                localCreatedUrls.push(objectUrl);
                return objectUrl;
            }
            // If it's already a string URL from Cloudinary/S3, use it directly!
            return file;
        });

        setPreviews(computedPreviews);

        // Revoke only the temporary local object URLs to prevent browser memory leaks
        return () => {
            localCreatedUrls.forEach((url) => URL.revokeObjectURL(url));
        };
    }, [files]);

    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;

        const newFiles = Array.from(e.target.files);
        const updatedFiles = [...files, ...newFiles];

        setValue("images", updatedFiles, { shouldValidate: true });
    };

    const removeImage = (indexToRemove: number) => {
        const updatedFiles = files.filter((_, i) => i !== indexToRemove);
        setValue("images", updatedFiles, { shouldValidate: true });

        if (thumbnailIndex === indexToRemove) {
            setValue("thumbnailIndex", 0, { shouldValidate: true });
        } else if (thumbnailIndex > indexToRemove) {
            setValue("thumbnailIndex", thumbnailIndex - 1, { shouldValidate: true });
        }
    };

    return (
        <Card className={errors.images ? "border-destructive" : ""}>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span>Product Media</span>
                    <span className="text-xs font-normal text-muted-foreground">
                        {files.length} {files.length === 1 ? "image" : "images"} uploaded
                    </span>
                </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* UPLOAD AREA */}
                <label
                    className="
                        flex
                        cursor-pointer
                        flex-col
                        items-center
                        justify-center
                        rounded-xl
                        border-2
                        border-dashed
                        p-10
                        hover:bg-zinc-50/50
                        transition-colors
                        border-zinc-200
                    "
                >
                    <Upload className="h-8 w-8 text-zinc-400" />
                    <p className="mt-3 text-sm text-zinc-500 font-medium">
                        Upload multiple images
                    </p>
                    <p className="text-xs text-zinc-400 mt-1">
                        PNG, JPG, JPEG, or WEBP up to 5MB
                    </p>
                    <input
                        hidden
                        multiple
                        type="file"
                        accept="image/png, image/jpeg, image/jpg, image/webp"
                        onChange={handleUpload}
                    />
                </label>

                {/* ERROR PANEL BLOCKS */}
                {errors.images && (
                    <p className="text-sm font-medium text-destructive mt-1">
                        {errors.images.message as string}
                    </p>
                )}
                {errors.thumbnailIndex && (
                    <p className="text-sm font-medium text-destructive mt-1">
                        {errors.thumbnailIndex.message as string}
                    </p>
                )}

                {/* PREVIEW GRID */}
                {previews.length > 0 && (
                    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                        {previews.map((imgUrl, index) => {
                            const isThumbnail = thumbnailIndex === index;

                            return (
                                <div
                                    key={imgUrl}
                                    className={`
                                        relative
                                        rounded-xl
                                        overflow-hidden
                                        border-2
                                        group
                                        transition-all
                                        ${isThumbnail ? "border-green-600 ring-2 ring-green-600/10" : "border-zinc-200"}
                                    `}
                                >
                                    <Image
                                        src={imgUrl}
                                        alt={`Product file ${index + 1}`}
                                        width={300}
                                        height={300}
                                        className="h-40 w-full object-cover"
                                        unoptimized
                                    />

                                    {/* SET THUMBNAIL BUTTON */}
                                    <Button
                                        type="button"
                                        size="icon"
                                        variant={isThumbnail ? "default" : "secondary"}
                                        className={`
                                            absolute left-2 top-2 h-8 w-8 transition-opacity
                                            ${isThumbnail ? "bg-green-600 hover:bg-green-700 opacity-100" : "opacity-80 group-hover:opacity-100"}
                                        `}
                                        onClick={() => setValue("thumbnailIndex", index, { shouldValidate: true })}
                                    >
                                        <Star className={`h-4 w-4 ${isThumbnail ? "fill-current text-white" : ""}`} />
                                    </Button>

                                    {/* REMOVE BUTTON */}
                                    <Button
                                        type="button"
                                        size="icon"
                                        variant="destructive"
                                        className="absolute right-2 top-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => removeImage(index)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>

                                    {/* VISIBLE BADGE INDICATOR */}
                                    {isThumbnail && (
                                        <div className="absolute bottom-0 w-full bg-green-600 py-1 text-center text-[11px] font-semibold text-white tracking-wide">
                                            Cover Thumbnail
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}