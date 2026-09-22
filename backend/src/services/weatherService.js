import axios from "axios";

const getWeather = async (latitude, longitude) => {
  try {
    const response = await axios.get(
      "https://api.openweathermap.org/data/2.5/weather",
      {
        params: {
          lat: latitude,
          lon: longitude,
          appid: process.env.WEATHER_API_KEY,
          units: "metric",
        },
      }
    );

    const data = response.data;

    return {
      location: data.name,
      temperature: data.main.temp,
      feelsLike: data.main.feels_like,
      humidity: data.main.humidity,
      pressure: data.main.pressure,
      windSpeed: data.wind.speed,
      weather: data.weather[0].main,
      description: data.weather[0].description,
      rainfall: data.rain?.["1h"] || 0,
    };
  } catch (error) {
  console.error("Weather API Error:", {
    message: error.message,
    status: error.response?.status,
    data: error.response?.data,
  });

  throw new Error("Unable to fetch weather data");
}
};

export const getWeatherForecast = async (latitude, longitude) => {
  try {
    const response = await axios.get(
      "https://api.openweathermap.org/data/2.5/forecast",
      {
        params: {
          lat: latitude,
          lon: longitude,
          appid: process.env.WEATHER_API_KEY,
          units: "metric",
        },
      }
    );

    const data = response.data;

    const forecast = data.list.map((item) => ({
      dateTime: item.dt_txt,
      temperature: item.main.temp,
      feelsLike: item.main.feels_like,
      humidity: item.main.humidity,
      weather: item.weather[0].main,
      description: item.weather[0].description,
      rainProbability: Math.round((item.pop || 0) * 100),
      rainfall: item.rain?.["3h"] || 0,
      windSpeed: item.wind.speed,
    }));

    return {
      location: data.city.name,
      forecast,
    };
  } catch (error) {
    console.error("Forecast API Error:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });

    throw new Error("Unable to fetch weather forecast");
  }
};

export default getWeather;