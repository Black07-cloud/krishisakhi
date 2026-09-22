import mongoose from "mongoose";

import Farm from "../models/Farm.js";
import Crop from "../models/Crop.js";
import FarmTask from "../models/FarmTask.js";
import { runFarmAutomation as runAutomationService } from "../services/farmAutomationService.js";
import { runCropStageAutomation, runWeatherAutomation } from "../services/taskAutomationService.js";

const VALID_TASK_TYPES = [
  "irrigation",
  "fertilizer",
  "pest",
  "disease",
  "harvest",
  "planting",
  "inspection",
  "weather",
  "market",
  "general",
];
const VALID_PRIORITIES = ["low", "normal", "high", "urgent"];
const VALID_STATUSES = ["pending", "in_progress", "completed", "cancelled"];
const VALID_SOURCES = ["manual", "automation", "ai"];

// Helper function to validate ObjectIds
const isValidId = (id) => id && mongoose.Types.ObjectId.isValid(id);

/**
 * GET /api/tasks
 * Query params: page, limit, status, type, priority, source, farmId, cropId, search, from, to
 */
export const getTasks = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      type,
      priority,
      source,
      farmId,
      cropId,
      search,
      from,
      to,
    } = req.query;

    const query = { owner: req.user.userId };

    if (status) {
      if (!VALID_STATUSES.includes(status)) {
        return res.status(400).json({ success: false, message: "Invalid task status" });
      }
      query.status = status;
    }

    if (type) {
      if (!VALID_TASK_TYPES.includes(type)) {
        return res.status(400).json({ success: false, message: "Invalid task type" });
      }
      query.type = type;
    }

    if (priority) {
      if (!VALID_PRIORITIES.includes(priority)) {
        return res.status(400).json({ success: false, message: "Invalid task priority" });
      }
      query.priority = priority;
    }

    if (source) {
      if (!VALID_SOURCES.includes(source)) {
        return res.status(400).json({ success: false, message: "Invalid task source" });
      }
      query.source = source;
    }

    if (farmId) {
      if (!isValidId(farmId)) {
        return res.status(400).json({ success: false, message: "Invalid farm ID" });
      }
      query.farm = farmId;
    }

    if (cropId) {
      if (!isValidId(cropId)) {
        return res.status(400).json({ success: false, message: "Invalid crop ID" });
      }
      query.crop = cropId;
    }

    if (search && String(search).trim()) {
      const term = String(search).trim();
      query.$or = [
        { title: { $regex: term, $options: "i" } },
        { description: { $regex: term, $options: "i" } },
        { reason: { $regex: term, $options: "i" } },
      ];
    }

    if (from || to) {
      query.dueAt = {};
      if (from) {
        const fromDate = new Date(from);
        if (!isNaN(fromDate)) query.dueAt.$gte = fromDate;
      }
      if (to) {
        const toDate = new Date(to);
        if (!isNaN(toDate)) query.dueAt.$lte = toDate;
      }
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    // Sorting: completed tasks sort by completedAt desc, otherwise dueAt asc
    const sortField = status === "completed" ? { completedAt: -1 } : { dueAt: 1, createdAt: -1 };

    const [tasks, total] = await Promise.all([
      FarmTask.find(query)
        .populate("farm", "name location")
        .populate("crop", "name currentStage status")
        .sort(sortField)
        .skip(skip)
        .limit(limitNum),
      FarmTask.countDocuments(query),
    ]);

    const pages = Math.ceil(total / limitNum) || 1;

    return res.status(200).json({
      success: true,
      tasks,
      data: tasks, // Backwards compatibility
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages,
      },
    });
  } catch (error) {
    console.error("Get Tasks Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch tasks",
    });
  }
};

/**
 * GET /api/tasks/upcoming
 */
export const getUpcomingTasks = async (req, res) => {
  try {
    const days = parseInt(req.query.days, 10) || 7;
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(now.getDate() + days);

    const query = {
      owner: req.user.userId,
      status: { $in: ["pending", "in_progress"] },
      dueAt: { $gte: now, $lte: futureDate },
    };

    const tasks = await FarmTask.find(query)
      .populate("farm", "name")
      .populate("crop", "name currentStage")
      .sort({ dueAt: 1 });

    return res.status(200).json({
      success: true,
      tasks,
      count: tasks.length,
    });
  } catch (error) {
    console.error("Get Upcoming Tasks Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch upcoming tasks",
    });
  }
};

/**
 * GET /api/tasks/overdue
 */
export const getOverdueTasks = async (req, res) => {
  try {
    const now = new Date();
    const query = {
      owner: req.user.userId,
      status: { $in: ["pending", "in_progress"] },
      dueAt: { $lt: now },
    };

    const tasks = await FarmTask.find(query)
      .populate("farm", "name")
      .populate("crop", "name currentStage")
      .sort({ dueAt: 1 });

    return res.status(200).json({
      success: true,
      tasks,
      count: tasks.length,
    });
  } catch (error) {
    console.error("Get Overdue Tasks Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch overdue tasks",
    });
  }
};

/**
 * GET /api/tasks/completed
 */
export const getCompletedTasks = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const query = {
      owner: req.user.userId,
      status: "completed",
    };

    const [tasks, total] = await Promise.all([
      FarmTask.find(query)
        .populate("farm", "name")
        .populate("crop", "name currentStage")
        .sort({ completedAt: -1, updatedAt: -1 })
        .skip(skip)
        .limit(limitNum),
      FarmTask.countDocuments(query),
    ]);

    const pages = Math.ceil(total / limitNum) || 1;

    return res.status(200).json({
      success: true,
      tasks,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages,
      },
    });
  } catch (error) {
    console.error("Get Completed Tasks Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch completed tasks",
    });
  }
};

/**
 * GET /api/tasks/stats
 */
export const getTaskStats = async (req, res) => {
  try {
    const ownerId = new mongoose.Types.ObjectId(req.user.userId);
    const now = new Date();

    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const [statsResult] = await FarmTask.aggregate([
      { $match: { owner: ownerId } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          pending: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } },
          inProgress: { $sum: { $cond: [{ $eq: ["$status", "in_progress"] }, 1, 0] } },
          completed: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } },
          cancelled: { $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] } },
          overdue: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $in: ["$status", ["pending", "in_progress"]] },
                    { $lt: ["$dueAt", now] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          today: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gte: ["$dueAt", startOfToday] },
                    { $lte: ["$dueAt", endOfToday] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          highPriority: {
            $sum: {
              $cond: [{ $in: ["$priority", ["high", "urgent"]] }, 1, 0],
            },
          },
          aiGenerated: { $sum: { $cond: [{ $eq: ["$source", "ai"] }, 1, 0] } },
          automationGenerated: { $sum: { $cond: [{ $eq: ["$source", "automation"] }, 1, 0] } },
        },
      },
    ]);

    const stats = statsResult || {
      total: 0,
      pending: 0,
      inProgress: 0,
      completed: 0,
      cancelled: 0,
      overdue: 0,
      today: 0,
      highPriority: 0,
      aiGenerated: 0,
      automationGenerated: 0,
    };

    delete stats._id;

    return res.status(200).json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error("Get Task Stats Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch task statistics",
    });
  }
};

/**
 * GET /api/tasks/farm/:farmId
 */
export const getFarmTasks = async (req, res) => {
  try {
    const { farmId } = req.params;

    if (!isValidId(farmId)) {
      return res.status(400).json({ success: false, message: "Invalid farm ID" });
    }

    const farm = await Farm.findOne({
      _id: farmId,
      owner: req.user.userId,
    });

    if (!farm) {
      return res.status(404).json({ success: false, message: "Farm not found" });
    }

    const tasks = await FarmTask.find({ owner: req.user.userId, farm: farmId })
      .populate("farm", "name")
      .populate("crop", "name currentStage")
      .sort({ dueAt: 1 });

    return res.status(200).json({
      success: true,
      tasks,
      count: tasks.length,
    });
  } catch (error) {
    console.error("Get Farm Tasks Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch farm tasks",
    });
  }
};

/**
 * GET /api/tasks/crop/:cropId
 */
export const getCropTasks = async (req, res) => {
  try {
    const { cropId } = req.params;

    if (!isValidId(cropId)) {
      return res.status(400).json({ success: false, message: "Invalid crop ID" });
    }

    const crop = await Crop.findOne({
      _id: cropId,
      owner: req.user.userId,
    });

    if (!crop) {
      return res.status(404).json({ success: false, message: "Crop not found" });
    }

    const tasks = await FarmTask.find({ owner: req.user.userId, crop: cropId })
      .populate("farm", "name")
      .populate("crop", "name currentStage")
      .sort({ dueAt: 1 });

    return res.status(200).json({
      success: true,
      tasks,
      count: tasks.length,
    });
  } catch (error) {
    console.error("Get Crop Tasks Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch crop tasks",
    });
  }
};

/**
 * GET /api/tasks/:id
 */
export const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({ success: false, message: "Invalid task ID" });
    }

    const task = await FarmTask.findOne({
      _id: id,
      owner: req.user.userId,
    })
      .populate("farm", "name location")
      .populate("crop", "name currentStage status");

    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    return res.status(200).json({
      success: true,
      task,
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

/**
 * POST /api/tasks
 */
export const createTask = async (req, res) => {
  try {
    const { farmId, farm, cropId, crop, title, description, type, priority, reason, dueAt, source } = req.body;
    const targetFarmId = farmId || farm;
    const targetCropId = cropId || crop || null;

    if (!isValidId(targetFarmId)) {
      return res.status(400).json({ success: false, message: "Valid farm ID is required" });
    }

    const farmExists = await Farm.findOne({
      _id: targetFarmId,
      owner: req.user.userId,
    });

    if (!farmExists) {
      return res.status(404).json({ success: false, message: "Farm not found" });
    }

    if (targetCropId) {
      if (!isValidId(targetCropId)) {
        return res.status(400).json({ success: false, message: "Invalid crop ID" });
      }
      const cropExists = await Crop.findOne({
        _id: targetCropId,
        owner: req.user.userId,
        farm: targetFarmId,
      });

      if (!cropExists) {
        return res.status(400).json({
          success: false,
          message: "Crop does not belong to selected farm",
        });
      }
    }

    if (!title || !String(title).trim()) {
      return res.status(400).json({ success: false, message: "Task title is required" });
    }

    if (type && !VALID_TASK_TYPES.includes(type)) {
      return res.status(400).json({ success: false, message: "Invalid task type" });
    }

    if (priority && !VALID_PRIORITIES.includes(priority)) {
      return res.status(400).json({ success: false, message: "Invalid task priority" });
    }

    if (source && !VALID_SOURCES.includes(source)) {
      return res.status(400).json({ success: false, message: "Invalid task source" });
    }

    let dueDate = new Date();
    if (dueAt) {
      dueDate = new Date(dueAt);
      if (isNaN(dueDate.getTime())) {
        return res.status(400).json({ success: false, message: "Invalid due date format" });
      }
    }

    const task = await FarmTask.create({
      owner: req.user.userId,
      farm: targetFarmId,
      crop: targetCropId,
      title: String(title).trim(),
      description: description ? String(description).trim() : "",
      type: type || "general",
      priority: priority || "normal",
      reason: reason ? String(reason).trim() : "",
      dueAt: dueDate,
      status: "pending",
      source: source || "manual",
    });

    const populatedTask = await FarmTask.findById(task._id)
      .populate("farm", "name")
      .populate("crop", "name currentStage");

    return res.status(201).json({
      success: true,
      message: "Task created successfully",
      task: populatedTask,
      data: populatedTask,
    });
  } catch (error) {
    console.error("Create Task Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create task",
    });
  }
};

/**
 * PUT /api/tasks/:id
 */
export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, type, priority, dueAt, reason, cropId, crop } = req.body;

    if (!isValidId(id)) {
      return res.status(400).json({ success: false, message: "Invalid task ID" });
    }

    const task = await FarmTask.findOne({
      _id: id,
      owner: req.user.userId,
    });

    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    if (title !== undefined) {
      if (!String(title).trim()) {
        return res.status(400).json({ success: false, message: "Title cannot be empty" });
      }
      task.title = String(title).trim();
    }

    if (description !== undefined) task.description = String(description).trim();
    if (reason !== undefined) task.reason = String(reason).trim();

    if (type !== undefined) {
      if (!VALID_TASK_TYPES.includes(type)) {
        return res.status(400).json({ success: false, message: "Invalid task type" });
      }
      task.type = type;
    }

    if (priority !== undefined) {
      if (!VALID_PRIORITIES.includes(priority)) {
        return res.status(400).json({ success: false, message: "Invalid task priority" });
      }
      task.priority = priority;
    }

    if (dueAt !== undefined) {
      const d = new Date(dueAt);
      if (isNaN(d.getTime())) {
        return res.status(400).json({ success: false, message: "Invalid due date format" });
      }
      task.dueAt = d;
    }

    const targetCropId = cropId !== undefined ? cropId : crop;
    if (targetCropId !== undefined) {
      if (targetCropId === null || targetCropId === "") {
        task.crop = null;
      } else {
        if (!isValidId(targetCropId)) {
          return res.status(400).json({ success: false, message: "Invalid crop ID" });
        }
        const cropExists = await Crop.findOne({
          _id: targetCropId,
          owner: req.user.userId,
          farm: task.farm,
        });
        if (!cropExists) {
          return res.status(400).json({ success: false, message: "Crop does not belong to task's farm" });
        }
        task.crop = targetCropId;
      }
    }

    await task.save();

    const updatedTask = await FarmTask.findById(task._id)
      .populate("farm", "name")
      .populate("crop", "name currentStage");

    return res.status(200).json({
      success: true,
      message: "Task updated successfully",
      task: updatedTask,
      data: updatedTask,
    });
  } catch (error) {
    console.error("Update Task Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update task",
    });
  }
};

/**
 * PATCH /api/tasks/:id/status
 */
export const updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!isValidId(id)) {
      return res.status(400).json({ success: false, message: "Invalid task ID" });
    }

    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be pending, in_progress, completed, or cancelled",
      });
    }

    const task = await FarmTask.findOne({
      _id: id,
      owner: req.user.userId,
    });

    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    task.status = status;

    if (status === "completed") {
      task.completedAt = new Date();
    } else {
      task.completedAt = null;
    }

    await task.save();

    const updatedTask = await FarmTask.findById(task._id)
      .populate("farm", "name")
      .populate("crop", "name currentStage");

    return res.status(200).json({
      success: true,
      message: `Task status updated to ${status}`,
      task: updatedTask,
      data: updatedTask,
    });
  } catch (error) {
    console.error("Update Task Status Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update task status",
    });
  }
};

/**
 * DELETE /api/tasks/:id
 */
export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({ success: false, message: "Invalid task ID" });
    }

    const task = await FarmTask.findOneAndDelete({
      _id: id,
      owner: req.user.userId,
    });

    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
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

/**
 * POST /api/tasks/automation/farm/:farmId
 */
export const runFarmAutomation = async (req, res) => {
  try {
    const { farmId } = req.params;

    if (!isValidId(farmId)) {
      return res.status(400).json({ success: false, message: "Invalid farm ID" });
    }

    const farm = await Farm.findOne({
      _id: farmId,
      owner: req.user.userId,
    });

    if (!farm) {
      return res.status(404).json({ success: false, message: "Farm not found" });
    }

    const automationResult = await runAutomationService({
      farmId,
      ownerId: req.user.userId,
    });

    // Also run crop stage automation for active crops on this farm
    const activeCrops = await Crop.find({ farm: farmId, owner: req.user.userId, status: "active" });
    let additionalTasks = [];

    for (const crop of activeCrops) {
      const stageTasks = await runCropStageAutomation({ crop, ownerId: req.user.userId });
      additionalTasks.push(...stageTasks);
    }

    return res.status(200).json({
      success: true,
      message: "Farm automation rules processed successfully",
      data: {
        ...automationResult,
        stageTasksCreated: additionalTasks.length,
      },
    });
  } catch (error) {
    console.error("Farm Automation Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to run farm automation",
    });
  }
};