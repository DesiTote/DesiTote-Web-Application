import { Request, Response, NextFunction } from "express";
import { archiveProductService, createProductService, getAdminProductByIdService, getAdminProductsService, updateProductByIdService } from "./product.service.js";
import { ApiError } from "../../utils/ApiError.js";

/**
 * Route handler controller intercepting client data and sending responses.
 */
export const handleCreateProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const multiPartFiles = req.files as Express.Multer.File[];

        const product = await createProductService(req.body, multiPartFiles);

        res.status(201).json({
            success: true,
            message: "Product created and media synchronized successfully.",
            data: product,
        });
    } catch (error: any) {
        next(error)
    }
};

/**
 * Route handler intercepting search and pagination criteria to return listing assets.
 */
export const handleGetAdminProducts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { products, pagination } = await getAdminProductsService(req.query);

        res.status(200).json({
            success: true,
            message: "Admin catalog data fetched successfully.",
            meta: pagination,
            data: products,
        });
    } catch (error: any) {
        next(error);
    }
};


export const getAdminProductById = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const productId = req.params.productId as string;

        // 1. Ensure the ID is provided (Express handles this via routing, but a sanity check doesn't hurt)
        if (!productId) {
            throw new ApiError(404, "Product identity ID parameter is required.")
        }

        // 2. Fetch the full asset document from the database service layer
        const product = await getAdminProductByIdService(productId);

        // 3. Fail-safe protection check if the product doesn't exist
        if (!product) {
            throw new ApiError(404, "The requested tracking item profile could not be found.");
        }

        // 4. Return the full payload envelope matching your frontend expectation
        res.status(200).json({
            success: true,
            message: "Product data fetched successfully.",
            data: product,
        });
    } catch (error) {
        // Pass the error along to your global Express error-handling middleware
        next(error);
    }
};

export const updateAdminProductById = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const productId = req.params.productId as string;
        const newUploadedFiles = (req.files as Express.Multer.File[]) || [];

        const result = await updateProductByIdService(productId, req.body, newUploadedFiles);

        res.status(200).json({
            success: true,
            message: "Product record managed and updated successfully",
            data: result,
        });

    } catch (error) {
        next(error);
    }
};

export const archiveProductController = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const productId  = req.params.productId as string;
        if (!productId) {
            throw new ApiError(400, "Product identifier parameter is required");
        }

        const archivedProduct = await archiveProductService(productId);

        res.status(200).json({
            success: true,
            message: "Product safely soft-deleted and transitioned to archived status",
            data: archivedProduct,
        });
    } catch (error) {
        next(error); // Pass error to global error interceptor middleware
    }
};