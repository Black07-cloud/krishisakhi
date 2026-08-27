import Farm from "../models/Farm.js";
import Crop from "../models/Crop.js";
import SoilRecord from "../models/SoilRecord.js";
import analyzeSoil from "./soilAnalysisService.js";
import detectDeficiencies from "./nutrientRecommendationService.js";
import getFertilizerRecommendation from "./fertilizerRecommendationService.js";
import recommendCrops from "./cropRecommendationService.js";

export const getFarmSoilIntelligence = async (farmId, ownerId) => {
  const farm = await Farm.findOne({
    _id: farmId,
    owner: ownerId,
    isActive: true,
  });

  if (!farm) {
    return null;
  }

  const soil = await SoilRecord.findOne({
    farm: farmId,
    owner: ownerId,
  }).sort({ testedAt: -1 });

  if (!soil) {
    return null;
  }

  const activeCrop = await Crop.findOne({
    farm: farmId,
    owner: ownerId,
    status: "active",
  }).sort({ createdAt: -1 });

  const analysis = analyzeSoil(soil);
  const deficiencies = detectDeficiencies(soil);
  const fertilizerRecommendation = getFertilizerRecommendation(soil, activeCrop);
  const cropRecommendations = recommendCrops({
    soil,
    farm,
    season: new Date().getMonth() >= 5 && new Date().getMonth() <= 10 ? "kharif" : "rabi",
  });

  return {
    farm: {
      id: farm._id,
      name: farm.name,
      soilType: farm.soilType,
      irrigationType: farm.irrigationType,
    },
    soil,
    activeCrop: activeCrop
      ? {
          id: activeCrop._id,
          name: activeCrop.name,
          currentStage: activeCrop.currentStage,
        }
      : null,
    analysis,
    deficiencies,
    fertilizerRecommendation,
    cropRecommendations: cropRecommendations.recommendations,
  };
};

export default getFarmSoilIntelligence;
