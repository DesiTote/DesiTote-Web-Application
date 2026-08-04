"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { X } from "lucide-react";
import { Controller } from "react-hook-form";
import { PRODUCT_CATEGORIES } from "@/types/customer/product.type";

type Props = {
    register: any;
    control: any;
    errors: any;
    tags: string[];
    tagInput: string;
    setTagInput: (value: string) => void;
    addTag: () => void;
    removeTag: (tag: string) => void;
};

export default function BasicInfoSection({
    register,
    control,
    errors,
    tags,
    tagInput,
    setTagInput,
    addTag,
    removeTag,
}: Props) {
    return (

        <Card>

            <CardHeader>
                <CardTitle>
                    Basic Information
                </CardTitle>
            </CardHeader>

            <CardContent className="space-y-5">

                <div>

                    <Label>
                        Product Title
                    </Label>

                    <Input
                        {...register("title")}
                        className="mt-2"
                        placeholder="Minimal Tote Bag"
                    />

                    {errors.title && (
                        <p className="text-red-500 text-sm mt-1">
                            {errors.title.message}
                        </p>
                    )}

                </div>

                <div>

                    <Label>
                        Short Description
                    </Label>

                    <textarea
                        rows={3}
                        {...register(
                            "shortDescription"
                        )}
                        className="w-full rounded-md border p-3 mt-2"
                    />
                    {errors.shortDescription && (
                        <p className="text-red-500 text-sm mt-1">
                            {errors.shortDescription.message}
                        </p>
                    )}

                </div>

                <div>

                    <Label>
                        Description
                    </Label>

                    <textarea
                        rows={6}
                        {...register(
                            "description"
                        )}
                        className="w-full rounded-md border p-3 mt-2"
                    />
                    {errors.description && (
                        <p className="text-red-500 text-sm mt-1">
                            {errors.description.message}
                        </p>
                    )}

                </div>
                <div>
                    <Label>Slug</Label>

                    <Input
                        {...register("slug")}
                        placeholder="minimal-tote-bag"
                        className="mt-2"
                    />

                    {errors.slug && (
                        <p className="text-red-500 text-sm mt-1">
                            {errors.slug.message}
                        </p>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4">

                    <div>
                        <Label>Color</Label>

                        <Input
                            {...register("color")}
                            placeholder="Black"
                            className="mt-2"
                        />

                        {errors.color && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.color.message}
                            </p>
                        )}
                    </div>

                    <div>
                        <Label>Material</Label>

                        <Input
                            {...register("material")}
                            placeholder="Canvas"
                            className="mt-2"
                        />

                        {errors.material && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.material.message}
                            </p>
                        )}
                    </div>

                </div>

                <div>
                    <Label> Product Category</Label>

                    <div>
                        <Controller
                            control={control}
                            name="productCategory"
                            render={({ field }) => (
                                <Select
                                    onValueChange={field.onChange}
                                    value={field.value}
                                >
                                    <SelectTrigger className="mt-2 w-full">
                                        <SelectValue placeholder="Select Product Category" />
                                    </SelectTrigger>

                                    <SelectContent>
                                        {PRODUCT_CATEGORIES.map((category) => (
                                            <SelectItem
                                                key={category}
                                                value={category}
                                            >
                                                {category}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />

                        {errors.productCategory && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.productCategory.message}
                            </p>
                        )}
                    </div>
                </div>

                <div className="space-y-3">

                    <Label>Tags</Label>

                    {/* Selected Tags */}

                    {tags.length > 0 && (

                        <div className="flex flex-wrap gap-2">

                            {tags.map(
                                (tag) => (
                                    <div
                                        key={tag}
                                        className="
                            flex
                            items-center
                            gap-1
                            px-3
                            py-1
                            rounded-full
                            bg-green-100
                            text-green-800
                            text-sm
                            border
                            border-green-200
                        "
                                    >
                                        {tag}

                                        <button
                                            type="button"
                                            onClick={() =>
                                                removeTag(
                                                    tag
                                                )
                                            }
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                )
                            )}

                        </div>

                    )}

                    {/* Input */}

                    <div className="flex gap-2">

                        <Input
                            value={tagInput}
                            onChange={(e) =>
                                setTagInput(
                                    e.target.value.toLowerCase()
                                )
                            }
                            placeholder="Add tag"
                            onKeyDown={(e) => {

                                if (
                                    e.key === "Enter"
                                ) {
                                    e.preventDefault();
                                    addTag();
                                }

                            }}
                        />

                        <button
                            type="button"
                            onClick={addTag}
                            className="px-4rounded-md w-6/12 cursor-pointer border  bg-[#166534] text-white hover:bg-[#14532d]"
                        >
                            Add
                        </button>

                    </div>

                </div>

            </CardContent>

        </Card>
    );
}