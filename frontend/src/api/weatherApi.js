import apiClient from "./axios";

export const getCurrentWeather = ({ latitude, longitude }) =>
  apiClient.get(`/weather/current?latitude=${latitude}&longitude=${longitude}`);

export const getWeatherForecast = ({ latitude, longitude }) =>
  apiClient.get(`/weather/forecast?latitude=${latitude}&longitude=${longitude}`);
