import express from "express";

import {
  createFarm,
  getMyFarms,
  getFarmById,
  updateFarm,
  deleteFarm,
} from "../Controllers/farmController.js";

import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/", createFarm);
router.get("/", getMyFarms);
router.get("/:id", getFarmById);
router.patch("/:id", updateFarm);
router.delete("/:id", deleteFarm);

export default router;