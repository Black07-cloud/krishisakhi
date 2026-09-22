import express from "express";
import {
  createDiseaseScan,
  getDiseaseScans,
  getLatestDiseaseScan,
  getDiseaseScanById,
  updateDiseaseResult,
  deleteDiseaseScan
} from "../controllers/diseaseController.js";
import protect from "../middleware/authMiddleware.js";
import { upload, handleUploadError } from "../middleware/uploadMiddleware.js";

const router = express.Router();

// All disease routes require authentication
router.use(protect);

// Create a new disease scan with image upload
router.post(
  "/scans",
  upload.single("image"),
  handleUploadError,
  createDiseaseScan
);

// Get all scans for authenticated user (with optional filters)
router.get("/scans", getDiseaseScans);

// Get latest scan for authenticated user
router.get("/scans/latest", getLatestDiseaseScan);

// Get specific scan by ID
router.get("/scans/:id", getDiseaseScanById);

// Update scan result (Internal endpoint to be called by future AI service)
router.patch("/scans/:id/result", updateDiseaseResult);

// Delete a disease scan
router.delete("/scans/:id", deleteDiseaseScan);

export default router;
