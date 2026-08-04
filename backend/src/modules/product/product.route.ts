import { Router } from "express";
import multer from "multer"
import { archiveProductController, getAdminProductById, handleCreateProduct, handleGetAdminProducts, updateAdminProductById } from "./product.controller.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { productZodSchema } from "./product.validation.js";
import { isAuthenticated, restrictTo } from "../../middlewares/auth.middleware.js";

const router = Router();


// Multer configured for lightning-fast memory buffers (essential for production deployments)
const uploadStorage = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 15* 1024 * 1024, // 15MB limit validation rule
    },
    fileFilter: (req, file, callback) => {
        const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
        if (allowedTypes.includes(file.mimetype)) {
            callback(null, true);
        } else {
            callback(new Error("Invalid file extension. Only JPG, JPEG, PNG, and WEBP are supported."));
        }
    },
});

/**
 * @route   POST /api/v1/products
 * @desc    Accepts multipart data fields alongside max 10 file inputs matching key "images"
 * @access  Protected / Administrator
*/
//  CORRECT ORDER

router.use(isAuthenticated, restrictTo("ADMIN"));
router.post(
    "/",
    uploadStorage.array("images", 10), // 1. Parse fields & files first
    validate(productZodSchema),        // 2. Validate the now-populated req.body
    handleCreateProduct                // 3. Save to database
);

router.get("/", handleGetAdminProducts);
router.get("/:productId", getAdminProductById);
router.patch("/:productId", uploadStorage.array("newImages", 10), validate(productZodSchema), updateAdminProductById)

// Soft-delete/Archive operation endpoint
router.patch("/:productId/archive", archiveProductController);

export default router;