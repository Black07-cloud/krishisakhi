import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { CloudSun, MapPin, RefreshCw, AlertCircle, Plus, Edit } from "lucide-react";
import { getFarms } from "../../api/farmApi";
import { getCurrentWeather, getWeatherForecast } from "../../api/weatherApi";
import CurrentWeatherCard from "../../components/weather/CurrentWeatherCard";
import ForecastList from "../../components/weather/ForecastList";
import WeatherInsights from "../../components/weather/WeatherInsights";
import "./Weather.css";

const Weather = () => {
  const [farms, setFarms] = useState([]);
  const [selectedFarmId, setSelectedFarmId] = useState("");
  const [loadingFarms, setLoadingFarms] = useState(true);

  // Weather states
  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [fetchedAt, setFetchedAt] = useState(null);

  const [loadingCurrent, setLoadingCurrent] = useState(false);
  const [loadingForecast, setLoadingForecast] = useState(false);

  const [errorCurrent, setErrorCurrent] = useState(null);
  const [errorForecast, setErrorForecast] = useState(null);

  // 1. Fetch user's farms list
  const fetchFarmsList = useCallback(async () => {
    setLoadingFarms(true);
    try {
      const res = await getFarms();
      const farmList = res?.data?.data ?? (Array.isArray(res?.data) ? res.data : []);
      const validFarms = Array.isArray(farmList) ? farmList : [];
      setFarms(validFarms);
      if (validFarms.length > 0 && !selectedFarmId) {
        setSelectedFarmId(validFarms[0]._id);
      }
    } catch (err) {
      console.error("Failed to load farms:", err);
    } finally {
      setLoadingFarms(false);
    }
  }, [selectedFarmId]);

  useEffect(() => {
    fetchFarmsList();
  }, [fetchFarmsList]);

  // Selected farm object
  const selectedFarm = farms.find((f) => f._id === selectedFarmId);

  // Coordinates helper
  const lat = selectedFarm?.location?.coordinates?.latitude;
  const lon = selectedFarm?.location?.coordinates?.longitude;
  const hasCoords =
    lat !== undefined && lat !== null && !isNaN(Number(lat)) &&
    lon !== undefined && lon !== null && !isNaN(Number(lon));

  // 2. Fetch current weather
  const fetchCurrentWeather = useCallback(async (latitude, longitude) => {
    setLoadingCurrent(true);
    setErrorCurrent(null);
    try {
      const res = await getCurrentWeather({ latitude, longitude });
      if (res?.data?.data) {
        setCurrentWeather(res.data.data);
        setFetchedAt(new Date());
      }
    } catch (err) {
      console.error("Failed to fetch current weather:", err);
      setErrorCurrent("Unable to load current weather data.");
    } finally {
      setLoadingCurrent(false);
    }
  }, []);

  // 3. Fetch weather forecast
  const fetchForecast = useCallback(async (latitude, longitude) => {
    setLoadingForecast(true);
    setErrorForecast(null);
    try {
      const res = await getWeatherForecast({ latitude, longitude });
      if (res?.data?.data) {
        setForecastData(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch weather forecast:", err);
      setErrorForecast("Unable to load weather forecast.");
    } finally {
      setLoadingForecast(false);
    }
  }, []);

  // Trigger weather fetch when selected farm coordinates are ready
  useEffect(() => {
    if (hasCoords) {
      fetchCurrentWeather(lat, lon);
      fetchForecast(lat, lon);
    } else {
      setCurrentWeather(null);
      setForecastData(null);
    }
  }, [selectedFarmId, hasCoords, lat, lon, fetchCurrentWeather, fetchForecast]);

  const handleRefresh = () => {
    if (hasCoords) {
      fetchCurrentWeather(lat, lon);
      fetchForecast(lat, lon);
    }
  };

  return (
    <div className="weather-page">
      {/* Page Header */}
      <div className="weather-page-header">
        <div className="weather-header-title-wrap">
          <h1 className="weather-title">
            <CloudSun size={26} color="#16a34a" /> Weather & Alerts
          </h1>
          <p className="weather-subtitle">
            Monitor weather conditions and plan farming activities with confidence.
          </p>
        </div>

        {/* Farm Selector Dropdown */}
        {farms.length > 0 && (
          <div className="weather-farm-selector-group">
            <MapPin size={16} color="#16a34a" />
            <select
              id="weather-farm-select"
              className="weather-farm-select"
              value={selectedFarmId}
              onChange={(e) => setSelectedFarmId(e.target.value)}
              aria-label="Select farm for weather"
            >
              {farms.map((f) => (
                <option key={f._id} value={f._id}>
                  {f.name} ({f.location?.district || f.location?.state || "Farm"})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      {loadingFarms ? (
        <div className="weather-hero-card skeleton-card" style={{ height: "220px" }} />
      ) : farms.length === 0 ? (
        /* No Farms Empty State */
        <div className="weather-warning-card">
          <div className="empty-icon">🌾</div>
          <h2 className="warning-title">No farms available</h2>
          <p className="warning-desc">
            Add a farm with its GPS location to view live weather conditions, forecasts, and alerts.
          </p>
          <Link to="/farms" className="btn btn-primary">
            <Plus size={16} /> Add Farm
          </Link>
        </div>
      ) : !hasCoords ? (
        /* Selected Farm Missing Coordinates Warning State */
        <div className="weather-warning-card">
          <AlertCircle size={36} color="#d97706" />
          <h2 className="warning-title">Location coordinates not configured</h2>
          <p className="warning-desc">
            The farm <strong>"{selectedFarm?.name}"</strong> does not have GPS coordinates set yet. Please edit the farm to add latitude and longitude.
          </p>
          <Link to="/farms" className="btn btn-primary">
            <Edit size={16} /> Update Farm Location
          </Link>
        </div>
      ) : (
        <>
          {/* Current Weather Hero Component */}
          {loadingCurrent ? (
            <div className="current-weather-hero-card skeleton-card" style={{ height: "240px" }} />
          ) : errorCurrent ? (
            <div className="farms-error-state">
              <AlertCircle size={32} />
              <h3>{errorCurrent}</h3>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => fetchCurrentWeather(lat, lon)}
              >
                <RefreshCw size={15} /> Retry Weather
              </button>
            </div>
          ) : (
            <CurrentWeatherCard
              weatherData={currentWeather}
              farm={selectedFarm}
              fetchedAt={fetchedAt}
              onRefresh={handleRefresh}
              refreshing={loadingCurrent || loadingForecast}
            />
          )}

          {/* Forecast List Component */}
          <ForecastList
            forecastData={forecastData}
            loading={loadingForecast}
            error={errorForecast}
            onRetry={() => fetchForecast(lat, lon)}
          />

          {/* Farm Weather Insights & Irrigation Shortcut */}
          <WeatherInsights
            currentWeather={currentWeather}
            forecastData={forecastData}
          />
        </>
      )}
    </div>
  );
};

export default Weather;
