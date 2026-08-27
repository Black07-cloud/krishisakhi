import express from "express";

import {
  getIrrigationRecommendation,
  getFarmIrrigationRecommendation,
} from "../Controllers/irrigationController.js";

import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/recommendation", getIrrigationRecommendation);
router.get("/farm/:farmId", getFarmIrrigationRecommendation);
export default router;
