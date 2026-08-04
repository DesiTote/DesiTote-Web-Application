"use client";

import { useParams } from "next/navigation";
import { useAdminProductById } from "@/hooks/admin/useProduct";

import ProductForm from "@/components/admin/products/ProductForm";
import QueryError from "@/components/shared/QueryError";
import ProductTableSkeleton from "@/components/skeletons/admin/ProductTableSkeleton";

export default function EditProductPage() {
    const params = useParams();
    const productId = params?.productId as string;

    // Pass the standard/default query params to locate the correct cache bucket
    const { data, isError, refetch,isLoading } = useAdminProductById(productId);

    if(isLoading)return <ProductTableSkeleton />

    if (isError || !data?.data) {
        return (
            <div className="py-12 flex justify-center">
                <QueryError
                    title="Product Fetch Failed"
                    message="Could not retrieve this product's data from cache or server."
                    redirectUrl="/manage-products"
                    redirectPageName="Products Catalog"
                    retry={() => refetch()}
                />
            </div>
        );
    }

    return (
        <div>
           
            <ProductForm
                isEditMode={true}
                productId={productId}
                productData={data.data}
            />
        </div>
    );
}