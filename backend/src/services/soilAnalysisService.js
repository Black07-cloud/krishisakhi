const soilThresholds = {
  ph: {
    low: 5.5,
    optimalLow: 6.0,
    optimalHigh: 7.5,
    high: 8.5,
  },
  nitrogen: { low: 40, medium: 80 },
  phosphorus: { low: 20, medium: 50 },
  potassium: { low: 30, medium: 60 },
  organicCarbon: { low: 0.5, medium: 0.75 },
};

const getPhStatus = (value) => {
  if (value < 5.5) return "strongly acidic";
  if (value >= 5.5 && value < 6.0) return "moderately acidic";
  if (value >= 6.0 && value <= 7.5) return "optimal";
  if (value > 7.5 && value <= 8.5) return "alkaline";
  return "strongly alkaline";
};

const getNutrientStatus = (value, config) => {
  if (value < config.low) return "low";
  if (value >= config.low && value <= config.medium) return "medium";
  return "high";
};

const getOverallStatus = (statusMap) => {
  const values = Object.values(statusMap);

  if (
    values.some(
      (value) =>
        value === "low" ||
        value === "strongly acidic" ||
        value === "strongly alkaline",
    )
  ) {
    return "attention required";
  }

  if (
    values.some(
      (value) =>
        value === "medium" ||
        value === "moderately acidic" ||
        value === "alkaline",
    )
  ) {
    return "monitor closely";
  }

  return "healthy";
};

export const analyzeSoil = (soil = {}) => {
  const ph = Number(soil.ph);
  const nitrogen = Number(soil.nitrogen ?? 0);
  const phosphorus = Number(soil.phosphorus ?? 0);
  const potassium = Number(soil.potassium ?? 0);
  const organicCarbon = Number(soil.organicCarbon ?? 0);

  const phStatus = getPhStatus(ph);
  const nitrogenStatus = getNutrientStatus(nitrogen, soilThresholds.nitrogen);
  const phosphorusStatus = getNutrientStatus(
    phosphorus,
    soilThresholds.phosphorus,
  );
  const potassiumStatus = getNutrientStatus(
    potassium,
    soilThresholds.potassium,
  );
  const organicCarbonStatus =
    organicCarbon < soilThresholds.organicCarbon.low
      ? "low"
      : organicCarbon <= soilThresholds.organicCarbon.medium
        ? "medium"
        : "good";

  const statusMap = {
    phStatus,
    nitrogenStatus,
    phosphorusStatus,
    potassiumStatus,
    organicCarbonStatus,
  };

  const deficiencies = [];

  if (phStatus !== "optimal") {
    deficiencies.push("pH is outside the preferred range");
  }

  if (nitrogenStatus === "low") {
    deficiencies.push("Nitrogen is low");
  }

  if (phosphorusStatus === "low") {
    deficiencies.push("Phosphorus is low");
  }

  if (potassiumStatus === "low") {
    deficiencies.push("Potassium is low");
  }

  if (organicCarbonStatus === "low") {
    deficiencies.push("Organic carbon is low");
  }

  const observations = [];

  if (phStatus === "optimal") {
    observations.push("Soil pH is in a suitable range for most common crops.");
  } else {
    observations.push(
      "Soil pH should be reviewed before planning nutrient applications.",
    );
  }

  if (nitrogenStatus === "low") {
    observations.push("Nitrogen management will be important for crop growth.");
  }

  if (organicCarbonStatus === "low") {
    observations.push(
      "Organic matter should be improved through compost or farmyard manure.",
    );
  }

  return {
    phStatus,
    nitrogenStatus,
    phosphorusStatus,
    potassiumStatus,
    organicCarbonStatus,
    micronutrientStatus: "monitor",
    overallStatus: getOverallStatus(statusMap),
    deficiencies,
    observations,
  };
};

export default analyzeSoil;
