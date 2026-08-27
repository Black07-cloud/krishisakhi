import getWeather, { getWeatherForecast } from "../services/weatherService.js";

export const getCurrentWeather = async (req, res) => {
  try {
    const { latitude, longitude } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: "Latitude and longitude are required",
      });
    }

    const weather = await getWeather(latitude, longitude);

    return res.status(200).json({
      success: true,
      data: weather,
    });
  } catch (error) {
    console.error("Weather Controller Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch weather",
    });
  }
};

export const getForecast = async (req, res) => {
  try {
    const { latitude, longitude } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: "Latitude and longitude are required",
      });
    }

    const forecast = await getWeatherForecast(
      latitude,
      longitude
    );

    return res.status(200).json({
      success: true,
      data: forecast,
    });
  } catch (error) {
    console.error("Forecast Controller Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch weather forecast",
    });
  }
};
