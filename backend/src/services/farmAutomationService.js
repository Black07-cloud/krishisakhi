import mongoose from "mongoose";

import Farm from "../models/Farm.js";
import Crop from "../models/Crop.js";
import FarmTask from "../models/FarmTask.js";
import SoilRecord from "../models/SoilRecord.js";

import getWeather, { getWeatherForecast } from "../services/weatherService.js";
import calculateIrrigation from "../services/irrigationService.js";
import { generateCropTasks } from "../services/cropAutomationService.js";

const TASK_TYPES = ["irrigation", "fertilizer", "pest", "harvest", "general"];
const TASK_PRIORITIES = ["low", "normal", "high", "urgent"];

export const createAutomationTask = async ({
  farmId,
  ownerId,
  title,
  type,
  priority = "normal",
  reason,
  dueAt,
}) => {
  if (!mongoose.Types.ObjectId.isValid(farmId)) {
    throw new Error("Valid farm ID is required");
  }

  if (!mongoose.Types.ObjectId.isValid(ownerId)) {
    throw new Error("Valid owner ID is required");
  }

  if (!title || !String(title).trim()) {
    throw new Error("Task title is required");
  }

  if (!TASK_TYPES.includes(type)) {
    throw new Error("Invalid task type");
  }

  if (!TASK_PRIORITIES.includes(priority)) {
    throw new Error("Invalid task priority");
  }

  const trimmedTitle = String(title).trim();

  const existingTask = await FarmTask.findOne({
    farm: farmId,
    owner: ownerId,
    title: trimmedTitle,
    type,
    status: "pending",
    source: "automation",
  });

  if (existingTask) {
    return existingTask;
  }

  const taskPayload = {
    farm: farmId,
    owner: ownerId,
    title: trimmedTitle,
    type,
    priority,
    status: "pending",
    source: "automation",
  };

  if (reason !== undefined && reason !== null) {
    taskPayload.reason = String(reason).trim();
  }

  if (dueAt) {
    const dueDate = new Date(dueAt);
    if (Number.isNaN(dueDate.getTime())) {
      throw new Error("Invalid due date");
    }
    taskPayload.dueAt = dueDate;
  }

  return FarmTask.create(taskPayload);
};

const createIrrigationTask = async ({ farmId, ownerId, irrigation }) => {
  const decision = irrigation?.decision === "skip" ? "monitor" : irrigation?.decision;

  if (decision === "irrigate") {
    return createAutomationTask({
      farmId,
      ownerId,
      title: "Irrigate Farm",
      type: "irrigation",
      priority: irrigation.priority || "high",
      reason: irrigation.reason,
    });
  }

  if (decision === "delay") {
    return createAutomationTask({
      farmId,
      ownerId,
      title: "Delay Irrigation",
      type: "irrigation",
      priority: "normal",
      reason: irrigation.reason,
    });
  }

  if (decision === "monitor") {
    return createAutomationTask({
      farmId,
      ownerId,
      title: "Monitor Irrigation",
      type: "irrigation",
      priority: "normal",
      reason: irrigation.reason,
    });
  }

  return null;
};

export const runFarmAutomation = async ({ farmId, ownerId }) => {
  const farm = await Farm.findOne({
    _id: farmId,
    owner: ownerId,
    isActive: true,
  });

  if (!farm) {
    return null;
  }

  const latitude = farm.location?.coordinates?.latitude;
  const longitude = farm.location?.coordinates?.longitude;

  if (latitude === undefined || longitude === undefined) {
    return {
      irrigationDecision: null,
      irrigationReason: null,
      irrigationTask: null,
      cropTasks: [],
      tasksCreated: 0,
    };
  }

  const [weather, forecastData] = await Promise.all([
    getWeather(latitude, longitude),
    getWeatherForecast(latitude, longitude),
  ]);

  const nextForecast = forecastData?.forecast?.[0] || null;

  const crop = await Crop.findOne({
    farm: farmId,
    owner: ownerId,
    status: "active",
  }).sort({ createdAt: -1 });

  const soil = await SoilRecord.findOne({
    farm: farmId,
    owner: ownerId,
  }).sort({ testedAt: -1 });

  const recommendation = calculateIrrigation({
    crop,
    soil,
    temperature: weather.temperature,
    humidity: weather.humidity,
    rainProbability: nextForecast?.rainProbability ?? 0,
    rainfall: nextForecast?.rainfall ?? 0,
  });

  const irrigationDecision = recommendation.decision === "skip" ? "monitor" : recommendation.decision;
  const irrigationTask = await createIrrigationTask({
    farmId,
    ownerId,
    irrigation: {
      ...recommendation,
      decision: irrigationDecision,
    },
  });

  const cropTasks = crop ? await generateCropTasks({ crop, ownerId }) : [];
  const createdTasks = [irrigationTask, ...cropTasks].filter(Boolean);

  return {
    irrigationDecision,
    irrigationReason: recommendation.reason,
    irrigationTask,
    cropTasks,
    tasksCreated: createdTasks.length,
  };
};

export default createIrrigationTask;