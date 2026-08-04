"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

import BasicInfoSection from "./BasicInfoSection";
import PricingSection from "./PricingSection";
import InventorySection from "./InventorySection";
import PublishingSection from "./PublishingSection";
import MediaSection from "./MediaSection";

import { useCreateProduct, useUpdateProduct } from "@/hooks/admin/useProduct"; // Added useUpdateProduct hook
import { productZodSchema, ProductFormValues } from "@/schemas/admin/product.schema";
import { Product } from "@/types/admin/product.type";


interface ProductFormProps {
    isEditMode?: boolean;
    productId?: string;
    productData?: Product;
}

export default function ProductForm({ isEditMode = false, productId, productData }: ProductFormProps) {
    const { mutate: createProduct, isPending: isCreating } = useCreateProduct();
    // Assuming you have a standard update hook setup:
    const { mutate: updatePdrouctById, isPending: isUpdating } = useUpdateProduct();
    const isPending = isCreating || isUpdating; // or (isCreating || isUpdating)

    const [tagInput, setTagInput] = useState("");

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        control,
        formState: { errors },
    } = useForm<ProductFormValues>({
        resolver: zodResolver(productZodSchema as any),
        defaultValues: {
            title: "",
            shortDescription: "",
            description: "",
            color: "",
            material: "",
            productCategory: "Tote Bag",
            sku: "",
            price: 0,
            discountPrice: 0,
            costPrice: 0,
            gstPercentage:0,
            stock: 0,
            weight: 0,
            dimensions: {
                length: 0,
                breadth: 0,
                height: 0,
            },
            images: [],
            thumbnailIndex: 0,
            isFeatured: false,
            isPublished: false,
            status: "ACTIVE",
            tags: [],
        },
    });

    useEffect(() => {
        if (isEditMode && productData) {
            // Find the index of the thumbnail string inside the images array
            const foundThumbnailIndex = productData.images.indexOf(productData.thumbnail);

            reset({
                title: productData.title,
                shortDescription: productData.shortDescription,
                description: productData.description,
                color: productData.color,
                material: productData.material,
                slug: productData.slug,
                // Cast the generic string into the strict literal types expected by your schema
                productCategory: productData.productCategory as "Tote Bag" | "Tshirt" | "Hoodie",
                sku: productData.sku,
                price: productData.price,
                discountPrice: productData.discountPrice,
                costPrice: productData.costPrice || 0,
                stock: productData.stock,
                weight: productData.weight,
                dimensions: {
                    length: productData.dimensions?.length || 0,
                    breadth: productData.dimensions?.breadth || 0,
                    height: productData.dimensions?.height || 0,
                },
                images: productData.images || [],
                thumbnailIndex: foundThumbnailIndex !== -1 ? foundThumbnailIndex : 0,
                isFeatured: productData.isFeatured,
                isPublished: productData.isPublished,
                status: productData.status,
                tags: productData.tags || [],
            });
        }
    }, [productData, isEditMode, reset]);

    const tags = watch("tags") || [];

    const onSubmit = (data: ProductFormValues) => {
        toast.loading(isEditMode ? "Updating product data..." : "Processing product data...");

        if (isEditMode && productId && data) {
            updatePdrouctById(
                { productId, data },
                {
                    onSuccess: () => {
                        toast.dismiss();
                        toast.success("Product updated smoothly!");
                        reset();
                        setTagInput("");
                    },
                    onError: (error) => {
                         toast.dismiss();
                        toast.error(error?.response?.data?.message || "Failed to update prodcut")
                    }
                } // Argument 2: Contextual lifecycle hooks
            );
        } else {
            createProduct(data, {
                onSuccess: () => {
                    toast.dismiss();
                    toast.success("Product created successfully!");
                    reset();
                    setTagInput("");
                },
                onError: (res: any) => {
                    toast.dismiss();
                    toast.error(res?.response?.data?.message || "Network execution error occurred.");
                }
            });
        }
    };

    const addTag = () => {
        const value = tagInput.trim().toLowerCase();
        if (!value || tags.includes(value)) return;

        const updatedTags = [...tags, value];
        setValue("tags", updatedTags, { shouldValidate: true });
        setTagInput("");
    };

    const removeTag = (tagToRemove: string) => {
        const updatedTags = tags.filter((tag) => tag !== tagToRemove);
        setValue("tags", updatedTags, { shouldValidate: true });
    };

    const onInvalidSubmit = (validationErrors: typeof errors) => {
        console.error("❌ Zod Validation Failed:", validationErrors);
        const errorFields = Object.keys(validationErrors);
        if (errorFields.length > 0) {
            const firstField = errorFields[0] as keyof typeof errors;
            const errorMessage = validationErrors[firstField]?.message || "Invalid field value";
            toast.error(`Validation Error (${String(firstField)}): ${errorMessage}`);
        }
    };

    return (
        <form
            onSubmit={handleSubmit(onSubmit, onInvalidSubmit)}
            className="grid lg:grid-cols-2 gap-6 items-start"
        >
            <div className="space-y-5">
                <BasicInfoSection
                    control={control}
                    register={register}
                    errors={errors}
                    tags={tags}
                    tagInput={tagInput}
                    setTagInput={setTagInput}
                    addTag={addTag}
                    removeTag={removeTag}
                />

                <InventorySection
                    register={register}
                    errors={errors}
                />
            </div>

            <div className="space-y-6">
                <MediaSection
                    setValue={setValue}
                    watch={watch}
                    errors={errors}
                />

                <PricingSection
                    register={register}
                    errors={errors}
                />

                <PublishingSection
                    register={register}
                    errors={errors}
                />
            </div>

            <div className="lg:col-span-2">
                <Button
                    type="submit"
                    disabled={isPending}
                    className="bg-[#166534] hover:bg-[#155e2f] text-white rounded-lg px-6 py-3 disabled:bg-zinc-400 transition-colors cursor-pointer"
                >
                    {isPending ? "Saving Asset..." : isEditMode ? "Update Product" : "Save Product"}
                </Button>
            </div>
        </form>
    );
}