import FarmTask from "../models/FarmTask.js";
import { createAutomationTask } from "./farmAutomationService.js";

export const stageTasks = {
  seed: [
    {
      title: "Check Seed Establishment",
      type: "general",
      priority: "normal",
      reason: "Monitor seed establishment and early field conditions.",
    },
  ],

  germination: [
    {
      title: "Monitor Germination",
      type: "irrigation",
      priority: "normal",
      reason: "Maintain suitable soil moisture during germination.",
    },
  ],

  vegetative: [
    {
      title: "Monitor Irrigation",
      type: "irrigation",
      priority: "normal",
      reason: "Vegetative growth requires consistent moisture management.",
    },
    {
      title: "Check Nutrient Requirement",
      type: "fertilizer",
      priority: "normal",
      reason:
        "Monitor crop nutrient requirements during vegetative growth.",
    },
    {
      title: "Inspect for Pests",
      type: "pest",
      priority: "normal",
      reason:
        "Regular pest inspection helps detect early infestation.",
    },
  ],

  flowering: [
    {
      title: "Monitor Flowering Stage",
      type: "general",
      priority: "normal",
      reason:
        "Monitor crop health and environmental conditions during flowering.",
    },
    {
      title: "Check Irrigation",
      type: "irrigation",
      priority: "high",
      reason: "Avoid water stress during flowering.",
    },
  ],

  fruiting: [
    {
      title: "Monitor Fruit Development",
      type: "general",
      priority: "normal",
      reason:
        "Monitor fruit development and crop health.",
    },
    {
      title: "Inspect for Pests",
      type: "pest",
      priority: "high",
      reason:
        "Fruit development can be vulnerable to pest attacks.",
    },
  ],

  maturity: [
    {
      title: "Prepare for Harvest",
      type: "harvest",
      priority: "high",
      reason:
        "Crop is approaching maturity and harvest preparation is required.",
    },
  ],

  harvest: [
    {
      title: "Harvest Crop",
      type: "harvest",
      priority: "high",
      reason:
        "Crop has reached the harvest stage.",
    },
  ],
};

export const cropStages = Object.keys(stageTasks);

export const getCropLifecycleTaskTitles = () => {
  return [
    ...new Set(
      Object.values(stageTasks)
        .flat()
        .map((task) => task.title)
    ),
  ];
};

const calculateLifecycleProgress = (crop) => {
  const now = new Date();

  const plantingDate = crop.plantingDate
    ? new Date(crop.plantingDate)
    : null;

  const expectedHarvestDate = crop.expectedHarvestDate
    ? new Date(crop.expectedHarvestDate)
    : null;

  const dayMs = 1000 * 60 * 60 * 24;

  const daysSincePlanting = plantingDate
    ? Math.max(0, Math.floor((now - plantingDate) / dayMs))
    : null;

  const estimatedDaysRemaining = expectedHarvestDate
    ? Math.max(0, Math.ceil((expectedHarvestDate - now) / dayMs))
    : null;

  let lifecycleProgressPercentage = null;

  if (plantingDate && expectedHarvestDate && expectedHarvestDate > plantingDate) {
    const totalDuration = expectedHarvestDate - plantingDate;
    const elapsed = now - plantingDate;

    lifecycleProgressPercentage = Math.min(
      100,
      Math.max(0, Math.round((elapsed / totalDuration) * 100))
    );
  }

  return {
    daysSincePlanting,
    estimatedDaysRemaining,
    lifecycleProgressPercentage,
  };
};

export const getCropLifecycleSummary = async ({ crop, ownerId }) => {
  const lifecycleTaskTitles = getCropLifecycleTaskTitles();
  const farmId = crop.farm?._id || crop.farm;

  const tasks = await FarmTask.find({
    farm: farmId,
    owner: ownerId,
    source: "automation",
    title: {
      $in: lifecycleTaskTitles,
    },
    status: {
      $in: ["pending", "completed"],
    },
  }).sort({
    createdAt: -1,
  });

  return {
    ...calculateLifecycleProgress(crop),
    pendingTasks: tasks.filter((task) => task.status === "pending"),
    completedTasks: tasks.filter((task) => task.status === "completed"),
  };
};

export const generateCropTasks = async ({ crop, ownerId }) => {
  const tasks = stageTasks[crop.currentStage] || [];
  const farmId = crop.farm?._id || crop.farm;

  const createdTasks = [];

  for (const task of tasks) {
    const createdTask = await createAutomationTask({
      farmId,
      ownerId,
      title: task.title,
      type: task.type,
      priority: task.priority,
      reason: task.reason,
    });

    createdTasks.push(createdTask);
  }

  return createdTasks;
};

export default generateCropTasks;