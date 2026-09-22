import {
  getUserFarmsTool,
  getUserCropsTool,
  getLatestSoilTool,
  getWeatherTool,
  getLatestDiseaseScanTool,
  getMarketPricesTool,
  getFinanceSummaryTool,
  getGovernmentSchemesTool,
  getUserTasksTool,
} from "../tools/allTools.js";

export const buildQueryContext = async (userId, intentObj) => {
  const { intent, entities } = intentObj;
  const context = {
    userId,
    intent: intent,
    entities: entities,
    dataSourcesUsed: [],
    farms: [],
    crops: [],
    soil: null,
    weather: null,
    disease: null,
    market: [],
    finance: null,
    schemes: [],
    tasks: [],
  };

  // Always fetch user's farms and crops for basic identity
  const farmsResult = await getUserFarmsTool(userId);
  if (farmsResult.success && farmsResult.data) {
    context.farms = farmsResult.data;
    context.dataSourcesUsed.push("farms");
  }

  const cropsResult = await getUserCropsTool(userId);
  if (cropsResult.success && cropsResult.data) {
    context.crops = cropsResult.data;
    context.dataSourcesUsed.push("crops");
  }

  // Selective context loading based on Intent
  switch (intent) {
    case "IRRIGATION":
      const [soilRes, weatherRes] = await Promise.all([
        getLatestSoilTool(userId),
        getWeatherTool(),
      ]);
      if (soilRes.success) {
        context.soil = soilRes.data;
        context.dataSourcesUsed.push("soil");
      }
      if (weatherRes.success) {
        context.weather = weatherRes.data;
        context.dataSourcesUsed.push("weather");
      }
      break;

    case "SOIL_ANALYSIS":
      const soilResult = await getLatestSoilTool(userId);
      if (soilResult.success) {
        context.soil = soilResult.data;
        context.dataSourcesUsed.push("soil");
      }
      break;

    case "WEATHER":
      const wRes = await getWeatherTool();
      if (wRes.success) {
        context.weather = wRes.data;
        context.dataSourcesUsed.push("weather");
      }
      break;

    case "DISEASE":
      const diseaseRes = await getLatestDiseaseScanTool(userId);
      if (diseaseRes.success) {
        context.disease = diseaseRes.data;
        context.dataSourcesUsed.push("disease");
      }
      break;

    case "MARKET":
    case "SELL_CROP":
      const targetCrop = entities?.crop || (context.crops[0]?.name) || "Tomato";
      const marketRes = await getMarketPricesTool(targetCrop);
      if (marketRes.success) {
        context.market = marketRes.data;
        context.dataSourcesUsed.push("market");
      }
      break;

    case "FINANCE":
      const finRes = await getFinanceSummaryTool(userId);
      if (finRes.success) {
        context.finance = finRes.data;
        context.dataSourcesUsed.push("finance");
      }
      break;

    case "GOVERNMENT_SCHEME":
      const schemeRes = await getGovernmentSchemesTool();
      if (schemeRes.success) {
        context.schemes = schemeRes.data;
        context.dataSourcesUsed.push("schemes");
      }
      break;

    case "TASK":
      const taskRes = await getUserTasksTool(userId);
      if (taskRes.success) {
        context.tasks = taskRes.data;
        context.dataSourcesUsed.push("tasks");
      }
      break;

    default:
      // General or Crop Advisory: load soil & weather if available
      const [sRes, wxRes] = await Promise.all([
        getLatestSoilTool(userId),
        getWeatherTool(),
      ]);
      if (sRes.success) context.soil = sRes.data;
      if (wxRes.success) context.weather = wxRes.data;
      break;
  }

  return context;
};
