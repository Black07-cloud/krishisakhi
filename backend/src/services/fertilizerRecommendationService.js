import detectDeficiencies from "./nutrientRecommendationService.js";

const genericNutrientActionMap = {
  nitrogen: {
    priority: "high",
    action: "Increase nitrogen availability using compost or a balanced nitrogen source.",
    suggestedInputs: [
      "well-decomposed organic manure",
      "nitrogen fertilizer according to a soil test recommendation",
    ],
  },
  phosphorus: {
    priority: "high",
    action: "Improve phosphorus availability for root development and flowering.",
    suggestedInputs: [
      "phosphorus-rich organic input",
      "soil-test-based phosphorus fertilizer",
    ],
  },
  potassium: {
    priority: "medium",
    action: "Support water regulation and fruit quality with potassium inputs.",
    suggestedInputs: [
      "potash source validated for crop needs",
      "organic potassium amendment if available",
    ],
  },
  zinc: {
    priority: "medium",
    action: "Correct zinc deficiency to support healthy growth and grain development.",
    suggestedInputs: ["zinc-containing micronutrient input", "soil-test-based micronutrient application"],
  },
  iron: {
    priority: "medium",
    action: "Improve iron availability to prevent chlorosis and poor vigor.",
    suggestedInputs: ["iron micronutrient source", "balanced soil amendment"],
  },
  organicCarbon: {
    priority: "high",
    action: "Increase soil organic matter to improve structure and fertility.",
    suggestedInputs: ["compost", "farmyard manure", "green manure"],
  },
  pH: {
    priority: "high",
    action: "Adjust pH to the crop-preferred range to improve nutrient availability.",
    suggestedInputs: ["lime or gypsum according to soil test guidance", "organic matter enhancement"],
  },
};

export const getFertilizerRecommendation = (soil = {}, crop = null) => {
  const deficiencies = detectDeficiencies(soil);

  const recommendations = deficiencies.map((item) => {
    const nutrientKey = item.nutrient === "pH" ? "pH" : item.nutrient;
    const config = genericNutrientActionMap[nutrientKey] || {
      priority: "medium",
      action: "Apply a balanced nutrient program and retest the soil after a season.",
      suggestedInputs: ["balanced organic amendment", "soil test informed fertilizer management"],
    };

    return {
      nutrient: nutrientKey,
      priority: config.priority,
      action: config.action,
      suggestedInputs: config.suggestedInputs,
    };
  });

  if (recommendations.length === 0) {
    recommendations.push({
      nutrient: "general",
      priority: "medium",
      action: "Maintain the current nutrient program and continue routine soil monitoring.",
      suggestedInputs: ["balanced organic matter management", "soil testing on a regular schedule"],
    });
  }

  const cropSpecificAdvice = crop
    ? [
        `For ${crop.name || "the current crop"}, focus on balanced nutrient management and avoid excessive chemical application.`,
        "Use field observations together with the latest soil test before finalizing fertilizer scheduling.",
      ]
    : [
        "Continue periodic soil tests to keep nutrient inputs aligned with field conditions.",
        "Prefer organic amendments where soil organic carbon or structure needs improvement.",
      ];

  return {
    recommendations,
    organicOptions: [
      "compost",
      "well-decomposed farmyard manure",
      "green manure",
      "bio-fertilizer as per local recommendation",
    ],
    generalAdvice: cropSpecificAdvice,
  };
};

export default getFertilizerRecommendation;
