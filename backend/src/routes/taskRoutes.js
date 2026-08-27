import express from "express";

import {
  getTasks,
  getTaskById,
  createTask,
  updateTaskStatus,
  deleteTask,
  runFarmAutomation,
} from "../Controllers/taskController.js";

import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/", getTasks);
router.post("/", createTask);
router.post("/automation/farm/:farmId", runFarmAutomation);
router.get("/:id", getTaskById);
router.patch("/:id/status", updateTaskStatus);
router.delete("/:id", deleteTask);

export default router;
