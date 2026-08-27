import express from "express";

import protect from "../middleware/authMiddleware.js";

import {
  getMarketPrices,
  getMarketPrice,
  syncMarketPrices,
  createManualMarketPrice,
  getFarmMarketIntelligenceController,
} from "../Controllers/marketController.js";

const router = express.Router();

router.use(protect);



router.get("/", getMarketPrices);



router.post("/sync", syncMarketPrices);



router.get("/farm/:farmId/intelligence", getFarmMarketIntelligenceController);


router.get("/:id", getMarketPrice);



router.post("/", createManualMarketPrice);

export default router;
