import { api } from "@/lib/axios";
import { ProductFormValues } from "@/schemas/admin/product.schema";
import { GetProductsParams, AdminProductDetailResponse } from "@/types/admin/product.type";

/**
 * Transforms structural product objects and native file handles into FormData,
 * then broadcasts the multi-part stream payload to the backend server.
 */
export const createProduct = async (formValues: ProductFormValues): Promise<any> => {
    const formData = new FormData();

    // 1. Map top-level key-values safely down into the FormData carrier stream
    Object.entries(formValues).forEach(([key, value]) => {
        // Separate media keys from regular text values
        if (key === "images" || key === "thumbnailIndex") return;

        if (typeof value === "object" && value !== null) {
            // Complex objects (dimensions, tags array) must be stringified over text parameters
            formData.append(key, JSON.stringify(value));
        } else {
            formData.append(key, String(value));
        }
    });

    // 2. Append the target thumbnail configuration numerical index reference
    formData.append("thumbnailIndex", String(formValues.thumbnailIndex));

    // 3. Unroll binary browser File buffers into individual parallel parameters
    if (formValues.images && formValues.images.length > 0) {
        formValues.images.forEach((fileInstance) => {
            // Key must explicitly match backend upload interceptor: uploadStorage.array("images")
            formData.append("images", fileInstance);
        });
    }

    const response = await api.post("/product", formData);
    return response.data;
};

/**
 * Updates an existing product by parsing a mixed media array (S3 URLs + local Files),
 * formatting them to separate multi-part parameters, and executing a PATCH request.
 */
export const updateProduct = async (productId: string, data: ProductFormValues): Promise<any> => {
    const formData = new FormData();

    // 1. Append standard product keys, stringifying complex objects and arrays
    Object.entries(data).forEach(([key, value]) => {
        if (key === "images" || key === "thumbnailIndex") return;

        if (typeof value === "object" && value !== null) {
            formData.append(key, JSON.stringify(value));
        } else {
            formData.append(key, String(value));
        }
    });

    // 2. Map down the required thumbnail configuration tracker index
    formData.append("thumbnailIndex", String(data.thumbnailIndex));

    // 3. Process the mixed images array cleanly
    if (data.images && data.images.length > 0) {
        data.images.forEach((imageItem) => {
            if (typeof imageItem === "string") {
                // Kept images: Append as primitive strings to let backend know what to retain
                formData.append("existingImages", imageItem);
            } else if (imageItem instanceof File) {
                // Newly added images: Append as fresh binary file payloads
                formData.append("newImages", imageItem);
            }
        });
    }

    // 4. Fire multi-part payload via a dynamically structured PATCH/PUT API route
    const response = await api.patch(`/product/${productId}`, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
    return response.data;
};

/**
 * Service to fetch admin dashboard products with filters
 */
export const fetchAdminProducts = async (params: GetProductsParams): Promise<AdminProductDetailResponse> => {
    const response = await api.get<AdminProductDetailResponse>("/product", { params });
    return response.data;
};

export const fetchAdminProductById = async (productId: string): Promise<any> => {
    const response = await api.get<any>(`/product/${productId}`);
    return response.data;
};

export const archiveProduct = async (productId: string): Promise<any> => {
    const response = await api.patch(`/product/${productId}/archive`);
    return response.data;
};