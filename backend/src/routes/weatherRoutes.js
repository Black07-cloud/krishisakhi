import express from "express";

import {
  getCurrentWeather,
  getForecast,
} from "../Controllers/weatherController.js";

import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/current", getCurrentWeather);
router.get("/forecast", getForecast);

export default router;