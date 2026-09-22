import express from "express";

import {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
  getUpcomingTasks,
  getOverdueTasks,
  getCompletedTasks,
  getTaskStats,
  getFarmTasks,
  getCropTasks,
  runFarmAutomation,
} from "../Controllers/taskController.js";

import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

// Specific routes first
router.get("/stats", getTaskStats);
router.get("/upcoming", getUpcomingTasks);
router.get("/overdue", getOverdueTasks);
router.get("/completed", getCompletedTasks);
router.get("/farm/:farmId", getFarmTasks);
router.get("/crop/:cropId", getCropTasks);
router.post("/automation/farm/:farmId", runFarmAutomation);

// Root collection routes
router.get("/", getTasks);
router.post("/", createTask);

// Single item routes
router.get("/:id", getTaskById);
router.put("/:id", updateTask);
router.patch("/:id/status", updateTaskStatus);
router.delete("/:id", deleteTask);

export default router;
