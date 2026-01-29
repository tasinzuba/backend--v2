import { Router } from "express";
import {
    getStats,
    getUsers,
    updateUserStatus,
    createCategory,
    updateCategory,
    deleteCategory
} from "../controllers/admin.controller";
import { authMiddleware, roleMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.use(authMiddleware, roleMiddleware(["ADMIN"]));

router.get("/stats", getStats);
router.get("/users", getUsers);
router.patch("/users/:id", updateUserStatus);

router.post("/categories", createCategory);
router.put("/categories/:id", updateCategory);
router.delete("/categories/:id", deleteCategory);

export default router;
