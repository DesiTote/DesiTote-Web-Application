import { Router } from "express";
import { optionalAuth } from "../../middlewares/optionalAuth.js";
import { getBestsellers, getPublicProductBySlug, getPublicProducts } from "./product.public.controller.js";
const router = Router();
router.get("/", optionalAuth, getPublicProducts);
router.get("/slug/:slug", optionalAuth, getPublicProductBySlug);
router.get("/bestsellers", getBestsellers);
export default router;
//# sourceMappingURL=product.public.route.js.map