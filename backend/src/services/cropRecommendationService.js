const cropProfiles = {
  Tomato: {
    pH: [6.0, 7.0],
    irrigation: "moderate",
    nutrientDemand: "moderate-high",
    soilType: ["loamy", "black", "red"],
    season: ["kharif", "rabi"],
  },
  Rice: {
    pH: [5.5, 7.0],
    irrigation: "high",
    nutrientDemand: "high",
    soilType: ["clay", "alluvial", "loamy"],
    season: ["kharif"],
  },
  Groundnut: {
    pH: [6.0, 7.5],
    irrigation: "moderate",
    nutrientDemand: "moderate",
    soilType: ["sandy", "loamy", "red"],
    season: ["kharif", "rabi"],
  },
  Millet: {
    pH: [5.5, 8.0],
    irrigation: "low",
    nutrientDemand: "low-moderate",
    soilType: ["sandy", "loamy", "red"],
    season: ["kharif", "summer"],
  },
  Banana: {
    pH: [6.0, 7.5],
    irrigation: "high",
    nutrientDemand: "high",
    soilType: ["loamy", "alluvial"],
    season: ["all"],
  },
};

const normalizeSeason = (season) => {
  if (!season) return "all";
  const value = String(season).toLowerCase();
  if (value.includes("kharif") || value.includes("rain")) return "kharif";
  if (value.includes("rabi") || value.includes("winter")) return "rabi";
  if (value.includes("summer")) return "summer";
  return value;
};

export const recommendCrops = ({ soil = {}, farm = {}, season } = {}) => {
  const pH = Number(soil.ph ?? 0);
  const nitrogen = Number(soil.nitrogen ?? 0);
  const phosphorus = Number(soil.phosphorus ?? 0);
  const potassium = Number(soil.potassium ?? 0);
  const organicCarbon = Number(soil.organicCarbon ?? 0);
  const soilType = String(farm.soilType || "").toLowerCase();
  const irrigationType = String(farm.irrigationType || "").toLowerCase();
  const normalizedSeason = normalizeSeason(season);

  const recommendations = Object.entries(cropProfiles).map(([cropName, profile]) => {
    let score = 0;
    let reasonParts = [];

    const pHRange = profile.pH;
    if (pH >= pHRange[0] && pH <= pHRange[1]) {
      score += 30;
      reasonParts.push(`pH range matches ${cropName} requirements.`);
    } else {
      reasonParts.push(`pH range is not ideal for ${cropName}.`);
    }

    if (nitrogen >= 40) {
      score += 15;
    }
    if (phosphorus >= 20) {
      score += 15;
    }
    if (potassium >= 30) {
      score += 15;
    }
    if (organicCarbon >= 0.5) {
      score += 15;
    }

    if (soilType && profile.soilType.includes(soilType)) {
      score += 10;
      reasonParts.push(`Soil type is suitable for ${cropName}.`);
    }

    if (irrigationType && profile.irrigation === "low" && irrigationType.includes("rainfed")) {
      score += 10;
    }

    if (profile.season.includes(normalizedSeason) || profile.season.includes("all")) {
      score += 10;
      reasonParts.push(`Season timing fits ${cropName}.`);
    }

    const finalScore = Math.min(100, Math.max(0, score));
    const suitability = finalScore >= 75 ? "high" : finalScore >= 50 ? "moderate" : "low";

    return {
      crop: cropName,
      suitability,
      score: finalScore,
      reason: reasonParts.join(" "),
    };
  }).sort((a, b) => b.score - a.score)
    .slice(0, 3);

  return { recommendations };
};

export default recommendCrops;
