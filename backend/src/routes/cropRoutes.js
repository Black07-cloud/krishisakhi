import express from "express";

import {
  createCrop,
  getMyCrops,
  getCropsByFarm,
  getCropById,
  updateCrop,
  deleteCrop,
  updateCropStage,
  getCropLifecycle,
} from "../controllers/cropController.js";

import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// All crop routes require authentication
router.use(protect);

// Create crop
router.post("/", createCrop);

// Get all crops of logged-in farmer
router.get("/", getMyCrops);

// Get crops belonging to a specific farm
router.get("/farm/:farmId", getCropsByFarm);

// Get crop lifecycle
router.get("/:id/lifecycle", getCropLifecycle);

// Update crop stage
router.patch("/:id/stage", updateCropStage);

// Get single crop
router.get("/:id", getCropById);

// Update crop
router.put("/:id", updateCrop);

// Delete crop
router.delete("/:id", deleteCrop);

export default router;