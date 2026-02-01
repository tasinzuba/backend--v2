import { Router } from "express";
import {
    getStats,
    getUsers,
    updateUserStatus,
    createCategory,
    updateCategory,
    deleteCategory,
    getOrders,
    getAllMedicines
} from "../controllers/admin.controller.js";
import { authMiddleware, roleMiddleware } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validation.middleware.js";
import { categorySchema } from "../validators/schemas.js";

const router = Router();

router.use(authMiddleware, roleMiddleware(["ADMIN"]));

router.get("/stats", getStats);
router.get("/users", getUsers);
router.patch("/users/:id", updateUserStatus);

router.post("/categories", validate(categorySchema), createCategory);
router.put("/categories/:id", updateCategory);
router.delete("/categories/:id", deleteCategory);
router.get("/orders", getOrders);
router.get("/medicines", getAllMedicines);

export default router;
