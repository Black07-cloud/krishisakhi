import express from "express";
import {
  getDashboard,
  getFarmDashboard,
} from "../Controllers/dashboardController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/", getDashboard);
router.get("/farm/:farmId", getFarmDashboard);

export default router;
