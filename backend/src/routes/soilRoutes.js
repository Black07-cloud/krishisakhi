import express from "express";

import {
  createSoilRecord,
  getSoilRecordById,
  getLatestSoilRecord,
  getSoilHistory,
  updateSoilRecord,
  deleteSoilRecord,
  getSoilIntelligence,
} from "../Controllers/soilController.js";

import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/", createSoilRecord);
router.get("/farm/:farmId/latest", getLatestSoilRecord);
router.get("/farm/:farmId/history", getSoilHistory);
router.get("/farm/:farmId/intelligence", getSoilIntelligence);
router.get("/:id", getSoilRecordById);
router.put("/:id", updateSoilRecord);
router.delete("/:id", deleteSoilRecord);

export default router;