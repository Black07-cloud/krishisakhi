import { createFarmTaskTool } from "../tools/allTools.js";

export const executeDemoReasoning = async (userMessage, context) => {
  const { intent, entities, farms, crops, soil, weather, disease, market, finance, schemes, tasks, userId } = context;

  const cropName = entities?.crop || (crops[0]?.name) || "Crop";
  const farm = farms[0] || { name: "My Farm" };

  let headline = "";
  let sections = [];
  let recommendation = "";
  let agentsUsed = [];
  let toolsUsed = [];
  let actions = [];

  // Check if action was explicitly requested by user (e.g. "Tomorrow morning irrigation schedule pannu")
  if (entities?.actionRequested && (intent === "IRRIGATION" || intent === "TASK")) {
    if (farms.length > 0) {
      const taskRes = await createFarmTaskTool(userId, {
        farmId: farm._id,
        cropId: crops[0]?._id,
        title: `Irrigate ${cropName} Field`,
        description: `Scheduled by Farmio AI based on user request: "${userMessage}"`,
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        priority: "high",
      });

      if (taskRes.success) {
        actions.push({
          type: "TASK_CREATED",
          title: `Irrigate ${cropName} Field`,
          dueDate: "Tomorrow morning 06:00 AM",
          data: taskRes.data,
        });
      }
    }
  }

  switch (intent) {
    case "GREETING":
      agentsUsed = ["GeneralAgent"];
      toolsUsed = ["getUserFarms"];
      headline = "👋 Vanakkam! Welcome to Farmio AI Assistant";
      sections = [
        `You currently have **${farms.length} farm(s)** registered (${farms.map((f) => f.name).join(", ") || "No farm registered yet"}).`,
        "I can help you monitor weather forecast, soil health, crop stages, market prices, finances, and government schemes.",
      ];
      recommendation = "Ask me anything about your farm or select a quick action below!";
      break;

    case "HELP":
      agentsUsed = ["GeneralAgent"];
      headline = "🤖 How Farmio AI Can Assist You Today";
      sections = [
        "**💧 Irrigation**: Ask when and how much to irrigate your crops.",
        "**🌦️ Weather**: Check rain probabilities and 3-day forecast.",
        "**🧪 Soil Health**: Interpret pH, NPK, and organic carbon levels.",
        "**📊 Market Prices**: Check current mandi prices and 30-day trends.",
        "**💰 Farm Finance**: Summarize income, expenses, and profit margins.",
        "**🏛️ Government Schemes**: Discover subsidies and eligibility.",
        "**🦠 Disease Detection**: Review recent crop disease scan records.",
      ];
      recommendation = "Select any topic or type your farming query in plain English, Tamil, or Thanglish!";
      break;

    case "IRRIGATION":
      agentsUsed = ["IrrigationAgent", "WeatherAgent", "SoilAgent", "CropAgent"];
      toolsUsed = ["getWeather", "getLatestSoil", "getUserCrops"];
      headline = `💧 Irrigation Advisory for ${cropName}`;

      const rainProb = weather?.rainProbability || 10;
      const moisture = soil?.moisture || "Moderate";

      sections = [
        `**Crop**: ${cropName} (${crops[0]?.currentStage || "Vegetative"} stage)`,
        `**Soil Moisture**: ${soil ? `${moisture}% (${soil.soilType || "Farm Soil"})` : "No recent soil test available"}`,
        `**Weather Forecast**: Rain probability is **${rainProb}%** for tomorrow.`,
      ];

      if (rainProb > 40) {
        recommendation = `🌧️ Rain expected (${rainProb}% chance). Delay irrigation for ${cropName} to conserve water and prevent waterlogging.`;
      } else {
        recommendation = `💡 Recommended to irrigate ${cropName} early morning using Drip Irrigation for 45 minutes to optimize root absorption.`;
      }
      break;

    case "WEATHER":
      agentsUsed = ["WeatherAgent"];
      toolsUsed = ["getWeather"];
      headline = "🌦️ Farm Weather Forecast";
      sections = [
        `**Current Temperature**: ${weather?.temp || 30}°C (${weather?.condition || "Partly Cloudy"})`,
        `**Humidity**: ${weather?.humidity || 65}% | **Wind**: ${weather?.windSpeed || 12} km/h`,
        `**Rain Probability**: ${weather?.rainProbability || 15}%`,
      ];
      recommendation = "Weather conditions are suitable for spraying and field activities today.";
      break;

    case "SOIL_ANALYSIS":
      agentsUsed = ["SoilAgent"];
      toolsUsed = ["getLatestSoil"];
      headline = `🧪 Soil Health Status — ${farm.name}`;

      if (soil) {
        sections = [
          `**pH Level**: ${soil.pH || 6.5} (${(soil.pH || 6.5) < 6.0 ? "Slightly Acidic" : (soil.pH || 6.5) > 7.5 ? "Alkaline" : "Optimal"})`,
          `**NPK Ratio**: Nitrogen: ${soil.nitrogen || "Medium"} | Phosphorus: ${soil.phosphorus || "High"} | Potassium: ${soil.potassium || "Medium"}`,
          `**Organic Carbon**: ${soil.organicCarbon || "0.65%"}`,
        ];
        recommendation = "Apply organic compost or bio-fertilizers to maintain balanced soil micronutrients.";
      } else {
        sections = ["No recent soil test record found for this farm in database."];
        recommendation = "Consider logging a soil health record under the Soil Health module to get tailored nutrient advice.";
      }
      break;

    case "MARKET":
    case "SELL_CROP":
      agentsUsed = ["MarketAgent"];
      toolsUsed = ["getMarketPrices"];
      headline = `📊 Market Price Report for ${cropName}`;

      if (market && market.length > 0) {
        const top = market[0];
        sections = [
          `**Latest Mandi**: ${top.market} (${top.district || top.state})`,
          `**Modal Price**: ₹${top.modalPrice} / ${top.unit}`,
          `**Price Range**: ₹${top.minPrice} – ₹${top.maxPrice} / ${top.unit}`,
          `**Data Type**: ${top.dataType === "live" ? "Live Mandi Data" : "Demo Market Reference"}`,
        ];
        recommendation = `Market prices for ${cropName} are holding steady. Check the Marketplace (/market/buy) to list produce or connect with regional buyers.`;
      } else {
        sections = [`No active market price listings found for ${cropName}.`];
        recommendation = "Explore the Marketplace module to check current buyer listings.";
      }
      break;

    case "FINANCE":
      agentsUsed = ["FinanceAgent"];
      toolsUsed = ["getFinanceSummary"];
      headline = "💰 Farm Finance Summary";

      if (finance) {
        sections = [
          `**Total Income**: ₹${(finance.totalIncome || 0).toLocaleString("en-IN")}`,
          `**Total Expenses**: ₹${(finance.totalExpense || 0).toLocaleString("en-IN")}`,
          `**Net Profit / Loss**: ₹${(finance.profit || 0).toLocaleString("en-IN")}`,
        ];
        recommendation = finance.profit >= 0
          ? "Your farm records show a positive net profit balance. Keep logging transaction receipts under Farm Finance."
          : "Expenses currently exceed recorded income. Review fertilizer and labor expenses in Farm Finance.";
      } else {
        sections = ["No financial records logged yet."];
        recommendation = "Add your first income or expense entry in the Farm Finance module.";
      }
      break;

    case "GOVERNMENT_SCHEME":
      agentsUsed = ["SchemeAgent"];
      toolsUsed = ["getGovernmentSchemes"];
      headline = "🏛️ Recommended Government Schemes";

      if (schemes && schemes.length > 0) {
        sections = schemes.slice(0, 3).map(
          (s) => `• **${s.name}** (${s.level === "central" ? "Central Govt" : "State Govt"}): ${s.description.slice(0, 100)}...`
        );
        recommendation = "Visit the Government Schemes module (/schemes) to view eligibility, required documents, and official portal application links.";
      } else {
        sections = ["No schemes currently available in database."];
        recommendation = "Visit /schemes for central and state agriculture subsidies.";
      }
      break;

    case "DISEASE":
      agentsUsed = ["DiseaseAgent"];
      toolsUsed = ["getLatestDiseaseScan"];
      headline = "🦠 Crop Disease Status";

      if (disease) {
        sections = [
          `**Detected Disease**: ${disease.diseaseName || "Healthy Crop"}`,
          `**Confidence**: ${disease.confidence || "92%"}`,
          `**Scan Date**: ${disease.createdAt ? new Date(disease.createdAt).toLocaleDateString("en-IN") : "Recent"}`,
        ];
        recommendation = disease.treatments && disease.treatments.length > 0
          ? `Treatment: ${disease.treatments[0]}`
          : "Scan images regularly under Disease Detection (/disease) to spot pest attacks early.";
      } else {
        sections = ["No recent disease scan records found."];
        recommendation = "Upload a crop leaf photo in the Disease Detection module (/disease) for instant AI diagnosis.";
      }
      break;

    default:
      agentsUsed = ["CropAgent", "GeneralAgent"];
      headline = `🌱 Farming Assistance for ${cropName}`;
      sections = [
        `Based on your registered records for **${farm.name}**:`,
        `Active Crops: ${crops.map((c) => c.name).join(", ") || "No crop registered"}`,
      ];
      recommendation = "Feel free to ask about weather forecasts, soil pH, market rates, or irrigation scheduling.";
      break;
  }

  return {
    headline,
    sections,
    recommendation,
    agentsUsed,
    toolsUsed,
    dataSources: context.dataSourcesUsed,
    actions,
  };
};
