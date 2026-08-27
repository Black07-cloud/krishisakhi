import Farm from "../models/Farm.js";
import Crop from "../models/Crop.js";
import SoilRecord from "../models/SoilRecord.js";
import FarmTask from "../models/FarmTask.js";
import getWeather, { getWeatherForecast } from "./weatherService.js";
import calculateIrrigation from "./irrigationService.js";
import { getFarmSoilIntelligence } from "./soilIntelligenceService.js";
import { getCropLifecycleSummary } from "./cropAutomationService.js";

const DASHBOARD_TASK_LIMIT = 10;

const formatFarm = (farm) => ({
  id: farm._id,
  name: farm.name,
  area: farm.area,
  soilType: farm.soilType,
  irrigationType: farm.irrigationType,
  location: farm.location,
});

const formatCrop = (crop) => {
  if (!crop) {
    return null;
  }

  return {
    id: crop._id,
    name: crop.name,
    variety: crop.variety,
    area: crop.area,
    plantingDate: crop.plantingDate,
    expectedHarvestDate: crop.expectedHarvestDate || null,
    currentStage: crop.currentStage,
    status: crop.status,
    lifecycleHistory: crop.lifecycleHistory || [],
  };
};

const formatSoil = (soil) => {
  if (!soil) {
    return null;
  }

  return {
    id: soil._id,
    testedAt: soil.testedAt,
    ph: soil.ph,
    nitrogen: soil.nitrogen,
    phosphorus: soil.phosphorus,
    potassium: soil.potassium,
    organicCarbon: soil.organicCarbon,
    micronutrients: soil.micronutrients,
    source: soil.source,
    notes: soil.notes,
  };
};

const formatTask = (task) => ({
  id: task._id,
  farm: task.farm,
  title: task.title,
  type: task.type,
  priority: task.priority,
  reason: task.reason,
  status: task.status,
  dueAt: task.dueAt || null,
  source: task.source,
  createdAt: task.createdAt,
  updatedAt: task.updatedAt,
});

const formatWeather = (weather) => {
  if (!weather) {
    return null;
  }

  return {
    location: weather.location,
    temperature: weather.temperature,
    feelsLike: weather.feelsLike,
    humidity: weather.humidity,
    pressure: weather.pressure,
    windSpeed: weather.windSpeed,
    weather: weather.weather,
    description: weather.description,
    rainfall: weather.rainfall,
  };
};

const getFarmCoordinates = (farm) => ({
  latitude: farm.location?.coordinates?.latitude,
  longitude: farm.location?.coordinates?.longitude,
});

const getWeatherContext = async (farm) => {
  const { latitude, longitude } = getFarmCoordinates(farm);

  if (latitude === undefined || longitude === undefined) {
    return {
      weather: null,
      forecast: null,
    };
  }

  try {
    const [weather, forecast] = await Promise.all([
      getWeather(latitude, longitude),
      getWeatherForecast(latitude, longitude).catch((error) => {
        console.error("Dashboard Weather Forecast Error:", error);
        return null;
      }),
    ]);

    return {
      weather,
      forecast,
    };
  } catch (error) {
    console.error("Dashboard Weather Error:", error);

    return {
      weather: null,
      forecast: null,
    };
  }
};

const getSoilIntelligenceSafely = async (farmId, ownerId, soil) => {
  if (!soil) {
    return null;
  }

  try {
    return await getFarmSoilIntelligence(farmId, ownerId);
  } catch (error) {
    console.error("Dashboard Soil Intelligence Error:", error);
    return null;
  }
};

const getIrrigationSafely = ({ crop, soil, weather, forecast }) => {
  if (!weather) {
    return null;
  }

  try {
    const nextForecast = forecast?.forecast?.[0] || null;

    return calculateIrrigation({
      crop,
      soil,
      temperature: weather.temperature,
      humidity: weather.humidity,
      rainProbability: nextForecast?.rainProbability ?? 0,
      rainfall: nextForecast?.rainfall ?? weather.rainfall ?? 0,
    });
  } catch (error) {
    console.error("Dashboard Irrigation Error:", error);
    return null;
  }
};

const getLifecycleSafely = async (crop, ownerId) => {
  if (!crop) {
    return null;
  }

  try {
    const lifecycle = await getCropLifecycleSummary({
      crop,
      ownerId,
    });

    return {
      currentStage: crop.currentStage,
      daysSincePlanting: lifecycle.daysSincePlanting,
      estimatedDaysRemaining: lifecycle.estimatedDaysRemaining,
      lifecycleProgressPercentage: lifecycle.lifecycleProgressPercentage,
      pendingTasks: lifecycle.pendingTasks.map(formatTask),
      completedTasks: lifecycle.completedTasks.map(formatTask),
    };
  } catch (error) {
    console.error("Dashboard Lifecycle Error:", error);
    return null;
  }
};

const buildFarmSummary = ({ crop, soil, weather, tasks, automation }) => ({
  farmCount: 1,
  activeCropCount: crop ? 1 : 0,
  pendingTaskCount: tasks.pendingCount,
  completedTaskCount: tasks.completedCount,
  automationTaskCount: automation.count,
  hasSoilData: Boolean(soil),
  hasWeatherData: Boolean(weather),
});

const buildOverallSummary = (farmDashboards) =>
  farmDashboards.reduce(
    (summary, farmDashboard) => ({
      farmCount: summary.farmCount + 1,
      activeCropCount:
        summary.activeCropCount + (farmDashboard.crop ? 1 : 0),
      pendingTaskCount:
        summary.pendingTaskCount + farmDashboard.tasks.pendingCount,
      completedTaskCount:
        summary.completedTaskCount + farmDashboard.tasks.completedCount,
      automationTaskCount:
        summary.automationTaskCount + farmDashboard.automation.count,
      hasSoilData: summary.hasSoilData || Boolean(farmDashboard.soil),
      hasWeatherData: summary.hasWeatherData || Boolean(farmDashboard.weather),
    }),
    {
      farmCount: 0,
      activeCropCount: 0,
      pendingTaskCount: 0,
      completedTaskCount: 0,
      automationTaskCount: 0,
      hasSoilData: false,
      hasWeatherData: false,
    }
  );

export const getFarmDashboardData = async (farm, ownerId) => {
  const farmId = farm._id;

  const [
    crop,
    soil,
    pendingTasks,
    completedTasks,
    pendingTaskCount,
    completedTaskCount,
    pendingAutomationTasks,
    recentAutomationTasks,
    pendingAutomationTaskCount,
    completedAutomationTaskCount,
    weatherContext,
  ] = await Promise.all([
    Crop.findOne({
      farm: farmId,
      owner: ownerId,
      status: "active",
    }).sort({ createdAt: -1 }),
    SoilRecord.findOne({
      farm: farmId,
      owner: ownerId,
    }).sort({ testedAt: -1 }),
    FarmTask.find({
      farm: farmId,
      owner: ownerId,
      status: "pending",
    })
      .sort({ dueAt: 1, createdAt: -1 })
      .limit(DASHBOARD_TASK_LIMIT),
    FarmTask.find({
      farm: farmId,
      owner: ownerId,
      status: "completed",
    })
      .sort({ updatedAt: -1 })
      .limit(DASHBOARD_TASK_LIMIT),
    FarmTask.countDocuments({
      farm: farmId,
      owner: ownerId,
      status: "pending",
    }),
    FarmTask.countDocuments({
      farm: farmId,
      owner: ownerId,
      status: "completed",
    }),
    FarmTask.find({
      farm: farmId,
      owner: ownerId,
      source: "automation",
      status: "pending",
    })
      .sort({ dueAt: 1, createdAt: -1 })
      .limit(DASHBOARD_TASK_LIMIT),
    FarmTask.find({
      farm: farmId,
      owner: ownerId,
      source: "automation",
      status: "completed",
    })
      .sort({ updatedAt: -1 })
      .limit(DASHBOARD_TASK_LIMIT),
    FarmTask.countDocuments({
      farm: farmId,
      owner: ownerId,
      source: "automation",
      status: "pending",
    }),
    FarmTask.countDocuments({
      farm: farmId,
      owner: ownerId,
      source: "automation",
      status: "completed",
    }),
    getWeatherContext(farm),
  ]);

  const [soilIntelligence, lifecycle] = await Promise.all([
    getSoilIntelligenceSafely(farmId, ownerId, soil),
    getLifecycleSafely(crop, ownerId),
  ]);

  const weather = formatWeather(weatherContext.weather);
  const irrigation = getIrrigationSafely({
    crop,
    soil,
    weather: weatherContext.weather,
    forecast: weatherContext.forecast,
  });

  const tasks = {
    pending: pendingTasks.map(formatTask),
    completed: completedTasks.map(formatTask),
    count: pendingTaskCount + completedTaskCount,
    pendingCount: pendingTaskCount,
    completedCount: completedTaskCount,
  };

  const automation = {
    pending: pendingAutomationTasks.map(formatTask),
    recent: recentAutomationTasks.map(formatTask),
    count: pendingAutomationTaskCount + completedAutomationTaskCount,
    pendingCount: pendingAutomationTaskCount,
    completedCount: completedAutomationTaskCount,
  };

  const dashboard = {
    farm: formatFarm(farm),
    crop: formatCrop(crop),
    soil: formatSoil(soil),
    soilIntelligence,
    weather,
    irrigation,
    tasks,
    automation,
    lifecycle,
  };

  return {
    summary: buildFarmSummary({
      crop,
      soil,
      weather,
      tasks,
      automation,
    }),
    ...dashboard,
  };
};

export const getUserDashboardData = async (ownerId) => {
  const farms = await Farm.find({
    owner: ownerId,
    isActive: true,
  }).sort({ createdAt: -1 });

  const farmDashboards = await Promise.all(
    farms.map(async (farm) => {
      const { summary, ...dashboard } = await getFarmDashboardData(farm, ownerId);
      return dashboard;
    })
  );

  return {
    summary: buildOverallSummary(farmDashboards),
    farms: farmDashboards,
  };
};

export const getOwnedActiveFarm = async (farmId, ownerId) =>
  Farm.findOne({
    _id: farmId,
    owner: ownerId,
    isActive: true,
  });
