import express from "express";

import {
  registerUser,
  loginUser,
  getMe,
  refreshAccessToken,
  logoutUser,
} from "../Controllers/authController.js";

import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/refresh", refreshAccessToken);

router.get("/me", protect, getMe);
router.post("/logout", protect, logoutUser);

export default router;