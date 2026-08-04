import { Router } from "express";
import {
    getTeamMembers,
    postCreateTeamMember
} from "./team.admin.controller.js";
 
import { isAuthenticated,restrictTo} from "../../middlewares/auth.middleware.js";
 
const router = Router();
 
router.use(isAuthenticated, restrictTo("ADMIN"));
 
router.get("/", getTeamMembers);
router.post("/", postCreateTeamMember);

export default router;
