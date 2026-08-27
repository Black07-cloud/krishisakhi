import mongoose from "mongoose";

import Farm from "../models/Farm.js";
import FarmTask from "../models/FarmTask.js";
import { runFarmAutomation as runAutomationService } from "../services/farmAutomationService.js";

const VALID_TASK_TYPES = ["irrigation", "fertilizer", "pest", "harvest", "general"];
const VALID_PRIORITIES = ["low", "normal", "high", "urgent"];
const VALID_STATUSES = ["pending", "completed", "cancelled"];
const VALID_SOURCES = ["manual", "automation"];

const sortTasks = (tasks) => {
  const statusOrder = {
    pending: 0,
    completed: 1,
    cancelled: 2,
  };

  return [...tasks].sort((a, b) => {
    const statusDiff = (statusOrder[a.status] ?? 99) - (statusOrder[b.status] ?? 99);
    if (statusDiff !== 0) return statusDiff;

    const aDueAt = a.dueAt ? new Date(a.dueAt).getTime() : Number.MAX_SAFE_INTEGER;
    const bDueAt = b.dueAt ? new Date(b.dueAt).getTime() : Number.MAX_SAFE_INTEGER;
    const dueDiff = aDueAt - bDueAt;
    if (dueDiff !== 0) return dueDiff;

    return new Date(b.createdAt) - new Date(a.createdAt);
  });
};

export const getTasks = async (req, res) => {
  try {
    const { status, type, priority, source, farmId } = req.query;
    const query = { owner: req.user.userId };

    if (status) {
      if (!VALID_STATUSES.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid task status",
        });
      }
      query.status = status;
    }

    if (type) {
      if (!VALID_TASK_TYPES.includes(type)) {
        return res.status(400).json({
          success: false,
          message: "Invalid task type",
        });
      }
      query.type = type;
    }

    if (priority) {
      if (!VALID_PRIORITIES.includes(priority)) {
        return res.status(400).json({
          success: false,
          message: "Invalid task priority",
        });
      }
      query.priority = priority;
    }

    if (source) {
      if (!VALID_SOURCES.includes(source)) {
        return res.status(400).json({
          success: false,
          message: "Invalid task source",
        });
      }
      query.source = source;
    }

    if (farmId) {
      if (!mongoose.Types.ObjectId.isValid(farmId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid farm ID",
        });
      }

      const farm = await Farm.findOne({
        _id: farmId,
        owner: req.user.userId,
        isActive: true,
      });

      if (!farm) {
        return res.status(404).json({
          success: false,
          message: "Farm not found",
        });
      }

      query.farm = farmId;
    }

    const tasks = await FarmTask.find(query).populate("farm", "name");
    const orderedTasks = sortTasks(tasks);

    return res.status(200).json({
      success: true,
      count: orderedTasks.length,
      data: orderedTasks,
    });
  } catch (error) {
    console.error("Get Tasks Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch tasks",
    });
  }
};

export const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID",
      });
    }

    const task = await FarmTask.findOne({
      _id: id,
      owner: req.user.userId,
    }).populate("farm", "name");

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    console.error("Get Task Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch task",
    });
  }
};

export const createTask = async (req, res) => {
  try {
    const { farm, title, type, priority, reason, dueAt, source } = req.body;

    if (!mongoose.Types.ObjectId.isValid(farm)) {
      return res.status(400).json({
        success: false,
        message: "Invalid farm ID",
      });
    }

    const farmExists = await Farm.findOne({
      _id: farm,
      owner: req.user.userId,
      isActive: true,
    });

    if (!farmExists) {
      return res.status(404).json({
        success: false,
        message: "Farm not found",
      });
    }

    if (!title || !String(title).trim()) {
      return res.status(400).json({
        success: false,
        message: "Task title is required",
      });
    }

    if (!VALID_TASK_TYPES.includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task type",
      });
    }

    if (!VALID_PRIORITIES.includes(priority)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task priority",
      });
    }

    if (source === "automation") {
      return res.status(400).json({
        success: false,
        message: "Automation tasks cannot be created manually",
      });
    }

    if (dueAt) {
      const dueDate = new Date(dueAt);
      if (Number.isNaN(dueDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid due date",
        });
      }
    }

    const task = await FarmTask.create({
      farm,
      owner: req.user.userId,
      title: String(title).trim(),
      type,
      priority,
      reason: reason ? String(reason).trim() : undefined,
      dueAt: dueAt ? new Date(dueAt) : undefined,
      status: "pending",
      source: "manual",
    });

    return res.status(201).json({
      success: true,
      message: "Task created successfully",
      data: task,
    });
  } catch (error) {
    console.error("Create Task Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create task",
    });
  }
};

export const updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID",
      });
    }

    if (!["completed", "cancelled"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be completed or cancelled",
      });
    }

    const task = await FarmTask.findOne({
      _id: id,
      owner: req.user.userId,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    if (task.status === "completed") {
      return res.status(400).json({
        success: false,
        message: status === "completed" ? "Task is already completed" : "Task is already completed",
      });
    }

    if (task.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: status === "cancelled" ? "Task is already cancelled" : "Task is already cancelled",
      });
    }

    if (task.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending tasks can be updated",
      });
    }

    task.status = status;
    await task.save();

    return res.status(200).json({
      success: true,
      message: status === "completed" ? "Task marked as completed" : "Task cancelled successfully",
      data: task,
    });
  } catch (error) {
    console.error("Update Task Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update task",
    });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID",
      });
    }

    const task = await FarmTask.findOneAndDelete({
      _id: id,
      owner: req.user.userId,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.error("Delete Task Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete task",
    });
  }
};

export const runFarmAutomation = async (req, res) => {
  try {
    const { farmId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(farmId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid farm ID",
      });
    }

    const farm = await Farm.findOne({
      _id: farmId,
      owner: req.user.userId,
      isActive: true,
    });

    if (!farm) {
      return res.status(404).json({
        success: false,
        message: "Farm not found",
      });
    }

    const automationResult = await runAutomationService({
      farmId,
      ownerId: req.user.userId,
    });

    if (!automationResult) {
      return res.status(404).json({
        success: false,
        message: "Farm not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Farm automation completed successfully",
      data: automationResult,
    });
  } catch (error) {
    console.error("Farm Automation Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to run farm automation",
    });
  }
};