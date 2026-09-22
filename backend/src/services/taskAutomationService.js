import FarmTask from "../models/FarmTask.js";
import Farm from "../models/Farm.js";
import Crop from "../models/Crop.js";

/**
 * Ensures duplicate active automation tasks are not created for the same owner/farm/crop/key.
 */
export const createOrGetAutomatedTask = async ({
  ownerId,
  farmId,
  cropId = null,
  title,
  description,
  type,
  priority = "normal",
  reason,
  dueAt,
  automationKey,
  metadata = {},
}) => {
  const query = {
    owner: ownerId,
    farm: farmId,
    status: { $in: ["pending", "in_progress"] },
  };

  if (cropId) query.crop = cropId;
  if (automationKey) query.automationKey = automationKey;
  else query.title = title;

  const existingTask = await FarmTask.findOne(query);
  if (existingTask) {
    return existingTask;
  }

  const defaultDue = dueAt || new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h default

  const newTask = await FarmTask.create({
    owner: ownerId,
    farm: farmId,
    crop: cropId,
    title,
    description: description || reason || title,
    type,
    priority,
    status: "pending",
    reason,
    dueAt: defaultDue,
    source: "automation",
    automationKey: automationKey || null,
    metadata,
  });

  return newTask;
};

/**
 * Generate automated tasks for a given crop based on lifecycle stage & harvest dates.
 */
export const runCropStageAutomation = async ({ crop, ownerId }) => {
  if (!crop) return [];

  const farmId = crop.farm?._id || crop.farm;
  const cropId = crop._id;
  const created = [];

  const stage = crop.currentStage?.toLowerCase();

  const STAGE_RULES = {
    seed: {
      title: `Inspect Seed Establishment (${crop.name})`,
      type: "planting",
      priority: "normal",
      reason: "Ensure seeds have proper soil contact and initial moisture.",
      key: `crop-${cropId}-seed-establishment`,
    },
    germination: {
      title: `Crop Inspection - Germination (${crop.name})`,
      type: "inspection",
      priority: "normal",
      reason: "Monitor seed germination rate and initial sprout growth.",
      key: `crop-${cropId}-germination-check`,
    },
    vegetative: {
      title: `Irrigation & Fertilizer Check (${crop.name})`,
      type: "fertilizer",
      priority: "normal",
      reason: "Vegetative stage requires optimal nitrogen and hydration balance.",
      key: `crop-${cropId}-vegetative-monitoring`,
    },
    flowering: {
      title: `Inspect for Flowering-Stage Pests (${crop.name})`,
      type: "pest",
      priority: "high",
      reason: "Flowering stage is vulnerable to thrips, aphids, and flower blights.",
      key: `crop-${cropId}-flowering-pests`,
    },
    fruiting: {
      title: `Monitor Hydration & Fruit Set (${crop.name})`,
      type: "irrigation",
      priority: "normal",
      reason: "Maintain steady moisture to prevent blossom end rot or fruit cracking.",
      key: `crop-${cropId}-fruiting-hydration`,
    },
    maturity: {
      title: `Prepare Harvest Logistics (${crop.name})`,
      type: "harvest",
      priority: "high",
      reason: "Crop is reaching harvest maturity. Organize storage, transport, and tools.",
      key: `crop-${cropId}-harvest-preparation`,
    },
  };

  if (stage && STAGE_RULES[stage]) {
    const rule = STAGE_RULES[stage];
    const task = await createOrGetAutomatedTask({
      ownerId,
      farmId,
      cropId,
      title: rule.title,
      description: rule.reason,
      type: rule.type,
      priority: rule.priority,
      reason: rule.reason,
      automationKey: rule.key,
    });
    created.push(task);
  }

  // Harvest date approaching rule
  if (crop.expectedHarvestDate) {
    const harvestDate = new Date(crop.expectedHarvestDate);
    const now = new Date();
    const daysUntilHarvest = Math.ceil((harvestDate - now) / (1000 * 60 * 60 * 24));

    if (daysUntilHarvest <= 7 && daysUntilHarvest >= 0) {
      const harvestReminderTask = await createOrGetAutomatedTask({
        ownerId,
        farmId,
        cropId,
        title: `Upcoming Harvest Reminder: ${crop.name}`,
        description: `Expected harvest date is ${harvestDate.toLocaleDateString()}. Finalize picking schedules.`,
        type: "harvest",
        priority: "urgent",
        reason: "Harvest date is less than 7 days away.",
        dueAt: harvestDate,
        automationKey: `crop-${cropId}-harvest-7days-reminder`,
      });
      created.push(harvestReminderTask);
    }
  }

  return created;
};

/**
 * Generate automated tasks based on weather alerts (e.g. heavy rain, extreme heat).
 */
export const runWeatherAutomation = async ({ farmId, ownerId, weatherData }) => {
  const created = [];
  if (!weatherData) return created;

  const temp = weatherData.temperature || weatherData.temp;
  const rainProb = weatherData.rainProbability || weatherData.pop;

  if (rainProb >= 70) {
    const task = await createOrGetAutomatedTask({
      ownerId,
      farmId,
      title: "Review Irrigation & Drainage",
      description: `Heavy rain predicted (${rainProb}% probability). Clear drainage paths and pause automated watering.`,
      type: "weather",
      priority: "high",
      reason: "Heavy rain risk detected in weather forecast.",
      automationKey: `farm-${farmId}-heavy-rain-review`,
    });
    created.push(task);
  }

  if (temp >= 38) {
    const task = await createOrGetAutomatedTask({
      ownerId,
      farmId,
      title: "Inspect Soil Hydration & Heat Stress",
      description: `High temperature (${temp}°C) recorded. Ensure crops receive adequate shading or supplemental hydration.`,
      type: "irrigation",
      priority: "urgent",
      reason: "Extreme heat warning.",
      automationKey: `farm-${farmId}-extreme-heat-check`,
    });
    created.push(task);
  }

  return created;
};

/**
 * Generate automated follow-up task after disease detection scan.
 */
export const runDiseaseScanAutomation = async ({ ownerId, farmId, cropId, diseaseName, severity }) => {
  if (!farmId) return null;

  return createOrGetAutomatedTask({
    ownerId,
    farmId,
    cropId,
    title: `Disease Treatment & Monitoring: ${diseaseName || "Crop Issue"}`,
    description: `Follow up on recent disease scan. Apply recommended treatments and monitor crop progression (${severity || "moderate"} severity).`,
    type: "disease",
    priority: severity === "high" || severity === "critical" ? "urgent" : "high",
    reason: `Automated task generated following disease detection scan for ${diseaseName || "disease"}.`,
    automationKey: `disease-${cropId || farmId}-${diseaseName || "alert"}-followup`,
  });
};
