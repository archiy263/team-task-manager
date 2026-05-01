import express from "express";
import { getDashboardStats } from "../controllers/dashboardController.js";
import protect from "../middlewares/protect.js";

const router = express.Router();

router.use(protect);
router.get("/stats", getDashboardStats);

export default router;
