import mongoose from "mongoose";

import Farm from "../models/Farm.js";
import Crop from "../models/Crop.js";
import SoilRecord from "../models/SoilRecord.js";

import getWeather, {
  getWeatherForecast,
} from "../services/weatherService.js";

import calculateIrrigation from "../services/irrigationService.js";
import createIrrigationTask from "../services/farmAutomationService.js";

// =====================================================
// 1. MANUAL IRRIGATION RECOMMENDATION
// =====================================================

export const getIrrigationRecommendation = async (req, res) => {
  try {
    const {
      temperature,
      humidity,
      rainProbability,
      rainfall,
    } = req.query;

    // Validate required inputs
    if (
      temperature === undefined ||
      humidity === undefined ||
      rainProbability === undefined ||
      rainfall === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Temperature, humidity, rainProbability and rainfall are required",
      });
    }

    // Convert query strings to numbers
    const temperatureValue = Number(temperature);
    const humidityValue = Number(humidity);
    const rainProbabilityValue = Number(rainProbability);
    const rainfallValue = Number(rainfall);

    // Validate numbers
    if (
      Number.isNaN(temperatureValue) ||
      Number.isNaN(humidityValue) ||
      Number.isNaN(rainProbabilityValue) ||
      Number.isNaN(rainfallValue)
    ) {
      return res.status(400).json({
        success: false,
        message: "All weather values must be valid numbers",
      });
    }

    // Calculate irrigation recommendation
    const recommendation = calculateIrrigation({
      temperature: temperatureValue,
      humidity: humidityValue,
      rainProbability: rainProbabilityValue,
      rainfall: rainfallValue,
    });

    return res.status(200).json({
      success: true,
      data: recommendation,
    });
  } catch (error) {
    console.error("Irrigation Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to generate irrigation recommendation",
    });
  }
};


// =====================================================
// 2. FARM-SPECIFIC IRRIGATION RECOMMENDATION
// =====================================================

export const getFarmIrrigationRecommendation = async (req, res) => {
  try {
    const { farmId } = req.params;

    // 1. Validate Farm ID
    if (!mongoose.Types.ObjectId.isValid(farmId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid farm ID",
      });
    }

    // 2. Get Farm
    const farm = await Farm.findOne({
      _id: farmId,
      owner: req.user.userId,
      isActive: true,
    });

    if (!farm) {
      return res.status(404).json({
        success: false,
        message: "Farm not found",
      });
    }

    // 3. Get Latest Crop
    const crop = await Crop.findOne({
      farm: farmId,
      owner: req.user.userId,
    }).sort({
      createdAt: -1,
    });

    // 4. Get Latest Soil Record
    const soil = await SoilRecord.findOne({
      farm: farmId,
      owner: req.user.userId,
    }).sort({
      testedAt: -1,
    });

    // 5. Get Coordinates
    const latitude = farm.location?.coordinates?.latitude;
    const longitude = farm.location?.coordinates?.longitude;

    if (
      latitude === undefined ||
      longitude === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "Farm location coordinates are required",
      });
    }

    // 6. Current Weather
    const weather = await getWeather(
      latitude,
      longitude
    );

    // 7. Weather Forecast
    const forecastData = await getWeatherForecast(
      latitude,
      longitude
    );

    // 8. Next Forecast
    const nextForecast =
      forecastData?.forecast?.[0] || null;

    // 9. Calculate Irrigation
    const recommendation = calculateIrrigation({
      crop,
      soil,
      temperature: weather.temperature,
      humidity: weather.humidity,
      rainProbability:
        nextForecast?.rainProbability ?? 0,
      rainfall:
        nextForecast?.rainfall ?? 0,
    });

    // 10. Create Automation Task
    const automatedTask = await createIrrigationTask({
      farmId: farm._id,
      ownerId: req.user.userId,
      irrigation: recommendation,
    });

    // 11. Response
    return res.status(200).json({
      success: true,

      data: {
        farm: {
          id: farm._id,
          name: farm.name,
          area: farm.area,
          soilType: farm.soilType,
          irrigationType: farm.irrigationType,
          location: farm.location,
        },

        crop: crop
          ? {
              id: crop._id,
              name: crop.name,
              variety: crop.variety,
            }
          : null,

        soil: soil
          ? {
              id: soil._id,
              ph: soil.ph,
              nitrogen: soil.nitrogen,
              phosphorus: soil.phosphorus,
              potassium: soil.potassium,
              organicCarbon: soil.organicCarbon,
            }
          : null,

        weather: {
          location: weather.location,
          temperature: weather.temperature,
          feelsLike: weather.feelsLike,
          humidity: weather.humidity,
          pressure: weather.pressure,
          windSpeed: weather.windSpeed,
          weather: weather.weather,
          description: weather.description,
          rainfall: weather.rainfall,
        },

        forecast: nextForecast,

        irrigation: recommendation,

        automatedTask,
      },
    });
  } catch (error) {
    console.error(
      "Farm Irrigation Recommendation Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to generate farm irrigation recommendation",
    });
  }
};