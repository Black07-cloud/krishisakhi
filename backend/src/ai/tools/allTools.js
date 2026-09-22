import Farm from "../../models/Farm.js";
import Crop from "../../models/Crop.js";
import SoilRecord from "../../models/SoilRecord.js";
import FarmTransaction from "../../models/FarmTransaction.js";
import MarketPrice from "../../models/MarketPrice.js";
import GovernmentScheme from "../../models/GovernmentScheme.js";
import DiseaseScan from "../../models/DiseaseScan.js";
import FarmTask from "../../models/FarmTask.js";

// Helper tool response wrapper
const formatToolResult = (success, data = null, message = "", source = "database") => ({
  success,
  data,
  message,
  source,
});

/* -------------------------------------------------------
   FARM TOOLS
------------------------------------------------------- */
export const getUserFarmsTool = async (userId) => {
  try {
    const farms = await Farm.find({ owner: userId, isActive: true }).lean();
    return formatToolResult(true, farms);
  } catch (err) {
    return formatToolResult(false, null, err.message);
  }
};

export const getFarmDetailsTool = async (userId, farmId) => {
  try {
    const farm = await Farm.findOne({ _id: farmId, owner: userId, isActive: true }).lean();
    if (!farm) return formatToolResult(false, null, "Farm not found");
    return formatToolResult(true, farm);
  } catch (err) {
    return formatToolResult(false, null, err.message);
  }
};

/* -------------------------------------------------------
   CROP TOOLS
------------------------------------------------------- */
export const getUserCropsTool = async (userId, farmId = null) => {
  try {
    const query = { owner: userId, status: "active" };
    if (farmId) query.farm = farmId;
    const crops = await Crop.find(query).populate("farm", "name location").lean();
    return formatToolResult(true, crops);
  } catch (err) {
    return formatToolResult(false, null, err.message);
  }
};

export const getCropDetailsTool = async (userId, cropId) => {
  try {
    const crop = await Crop.findOne({ _id: cropId, owner: userId }).populate("farm", "name location").lean();
    if (!crop) return formatToolResult(false, null, "Crop not found");
    return formatToolResult(true, crop);
  } catch (err) {
    return formatToolResult(false, null, err.message);
  }
};

/* -------------------------------------------------------
   SOIL TOOLS
------------------------------------------------------- */
export const getLatestSoilTool = async (userId, farmId = null) => {
  try {
    const query = { owner: userId };
    if (farmId) query.farm = farmId;
    const soil = await SoilRecord.findOne(query).sort({ recordedAt: -1, createdAt: -1 }).lean();
    if (!soil) return formatToolResult(false, null, "No recent soil record found");
    return formatToolResult(true, soil);
  } catch (err) {
    return formatToolResult(false, null, err.message);
  }
};

/* -------------------------------------------------------
   WEATHER TOOLS
------------------------------------------------------- */
export const getWeatherTool = async (location = null) => {
  // Demo / live weather simulation structure
  return formatToolResult(true, {
    temp: 31,
    condition: "Partly Cloudy",
    humidity: 65,
    windSpeed: 12,
    rainProbability: 15,
    forecast: [
      { day: "Tomorrow", temp: 30, rainProbability: 10, condition: "Sunny" },
      { day: "Day After", temp: 29, rainProbability: 40, condition: "Light Rain" },
    ],
  }, "Weather info", "weather_service");
};

/* -------------------------------------------------------
   DISEASE SCAN TOOLS
------------------------------------------------------- */
export const getLatestDiseaseScanTool = async (userId) => {
  try {
    const scan = await DiseaseScan.findOne({ user: userId }).sort({ createdAt: -1 }).lean();
    if (!scan) return formatToolResult(false, null, "No disease scan records found");
    return formatToolResult(true, scan);
  } catch (err) {
    return formatToolResult(false, null, err.message);
  }
};

/* -------------------------------------------------------
   MARKET TOOLS
------------------------------------------------------- */
export const getMarketPricesTool = async (cropName = "Tomato") => {
  try {
    const prices = await MarketPrice.find({
      isActive: true,
      cropName: new RegExp(cropName, "i"),
    })
      .sort({ priceDate: -1 })
      .limit(10)
      .lean();

    if (prices.length === 0) {
      // Fallback query any active prices
      const fallback = await MarketPrice.find({ isActive: true }).sort({ priceDate: -1 }).limit(10).lean();
      return formatToolResult(true, fallback, "General market prices");
    }

    return formatToolResult(true, prices);
  } catch (err) {
    return formatToolResult(false, null, err.message);
  }
};

/* -------------------------------------------------------
   FINANCE TOOLS
------------------------------------------------------- */
export const getFinanceSummaryTool = async (userId, farmId = null) => {
  try {
    const query = { owner: userId };
    if (farmId) query.farm = farmId;

    const stats = await FarmTransaction.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalIncome: { $sum: { $cond: [{ $eq: ["$type", "income"] }, "$amount", 0] } },
          totalExpense: { $sum: { $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0] } },
          count: { $sum: 1 },
        },
      },
    ]);

    const data = stats[0] || { totalIncome: 0, totalExpense: 0, count: 0 };
    return formatToolResult(true, {
      ...data,
      profit: data.totalIncome - data.totalExpense,
    });
  } catch (err) {
    return formatToolResult(false, null, err.message);
  }
};

/* -------------------------------------------------------
   SCHEME TOOLS
------------------------------------------------------- */
export const getGovernmentSchemesTool = async (category = null) => {
  try {
    const query = { isActive: true };
    if (category) query.category = category;
    const schemes = await GovernmentScheme.find(query).limit(5).lean();
    return formatToolResult(true, schemes);
  } catch (err) {
    return formatToolResult(false, null, err.message);
  }
};

/* -------------------------------------------------------
   TASK & ACTION TOOLS
------------------------------------------------------- */
export const getUserTasksTool = async (userId, farmId = null) => {
  try {
    const query = { owner: userId };
    if (farmId) query.farm = farmId;
    const tasks = await FarmTask.find(query).sort({ dueAt: 1 }).limit(10).lean();
    return formatToolResult(true, tasks);
  } catch (err) {
    return formatToolResult(false, null, err.message);
  }
};

export const createFarmTaskTool = async (userId, taskData) => {
  try {
    const due = taskData.dueAt || taskData.dueDate ? new Date(taskData.dueAt || taskData.dueDate) : new Date(Date.now() + 86400000);
    const prio = ["low", "normal", "high", "urgent"].includes(taskData.priority) ? taskData.priority : "normal";

    const task = new FarmTask({
      owner: userId,
      farm: taskData.farmId,
      crop: taskData.cropId || null,
      title: taskData.title,
      description: taskData.description || "Created via Farmio AI Assistant",
      type: taskData.type || "general",
      priority: prio,
      dueAt: due,
      status: "pending",
      source: "ai",
    });
    await task.save();
    return formatToolResult(true, task, "Task created successfully in database");
  } catch (err) {
    return formatToolResult(false, null, err.message);
  }
};

