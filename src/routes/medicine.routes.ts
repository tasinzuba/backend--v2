import { Router } from "express";
import { getAllMedicines, getMedicineById, getCategories } from "../controllers/medicine.controller.js";

const router = Router();

router.get("/categories", getCategories);
router.get("/", getAllMedicines);
router.get("/:id", getMedicineById);

export default router;
