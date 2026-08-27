const calculateIrrigation = ({
  crop,
  soil,
  temperature,
  humidity,
  rainProbability,
  rainfall,
}) => {
  let decision = "irrigate";
  let priority = "normal";
  let reason = "";

  if (rainProbability >= 60 || rainfall >= 5) {
    decision = "monitor";
    priority = "low";
    reason =
      "Strong rainfall is expected, so irrigation can be monitored instead of applied immediately.";
  } else if (rainProbability >= 30 || rainfall >= 2) {
    decision = "delay";
    priority = "normal";
    reason = "Rain is likely, so irrigation should be delayed and reassessed.";
  } else if (temperature >= 35 && humidity <= 50) {
    decision = "irrigate";
    priority = "high";
    reason =
      "High temperature and low humidity indicate increased crop water demand.";
  } else if (soil && soil.ph !== undefined && soil.ph < 5.5) {
    decision = "irrigate";
    priority = "normal";
    reason =
      "The soil is acidic and the crop should be monitored closely for water and nutrient stress.";
  } else {
    decision = "irrigate";
    priority = "normal";
    reason =
      "Current weather conditions do not indicate significant rainfall, so normal irrigation is recommended.";
  }

  const cropInfo = crop ? ` Current crop: ${crop.name}.` : "";

  return {
    decision,
    priority,
    reason: reason + cropInfo,
    waterSavingAdvice:
      decision === "monitor"
        ? "Use the expected rainfall and monitor soil moisture before irrigating."
        : decision === "delay"
          ? "Wait for the rainfall window before irrigating."
          : "Prefer drip irrigation and irrigate during cooler hours.",
  };
};

export default calculateIrrigation;
