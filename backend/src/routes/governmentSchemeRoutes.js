import express from "express";
import {
  getSchemes,
  getSchemeById,
  getSchemeFilters,
} from "../controllers/governmentSchemeController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// All government scheme routes require authentication
router.use(protect);

// Get scheme filter metadata (categories, states, levels)
// Must be defined before /:id route
router.get("/filters", getSchemeFilters);

// Get all schemes (with query parameters for filtering/searching)
router.get("/", getSchemes);

// Get a single scheme by ID
router.get("/:id", getSchemeById);

export default router;
