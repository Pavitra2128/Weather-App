import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaSun, FaCloudRain, FaSnowflake, FaCloud } from 'react-icons/fa'; // Icons

interface WeatherSummary {
  date: string;
  averageTemp: number | null;
  maxTemp: number | null;
  minTemp: number | null;
  dominantWeatherCondition: string;
  averageHumidity: number | null; // Added for global summary
}

const WeatherApp: React.FC = () => {
  const [city, setCity] = useState<string>('');
  const [weatherSummary, setWeatherSummary] = useState<WeatherSummary | null>(null);
  const [humidity, setHumidity] = useState<number | null>(null);
  const [alerts, setAlerts] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [globalSummary, setGlobalSummary] = useState<WeatherSummary | null>(null);
  const [temperatureThreshold, setTemperatureThreshold] = useState<number>(20); // Default value of 20

  // Helper function to get the right weather icon
  const getWeatherIcon = (condition: string | undefined) => {
    if (!condition) return <FaCloud size={40} />; // Default icon if condition is not available
    const lowerCaseCondition = condition.toLowerCase();

    if (lowerCaseCondition.includes('sun')) return <FaSun size={40} />;
    if (lowerCaseCondition.includes('rain')) return <FaCloudRain size={40} />;
    if (lowerCaseCondition.includes('snow')) return <FaSnowflake size={40} />;
    return <FaCloud size={40} />;
  };

  // Fetch weather data based on the city
  const fetchWeatherData = async (city: string) => {
    try {
      const response = await axios.get(`/api/weather?city=${city}`);
      const weatherData = response.data;

      if (weatherData.summary) {
        setGlobalSummary(weatherData.summary);
      }

      const summaryData: WeatherSummary = {
        date: new Date().toLocaleDateString(),
        averageTemp: weatherData.summary.averageTemp ?? null,
        maxTemp: weatherData.summary.maxTemp ?? null,
        minTemp: weatherData.summary.minTemp ?? null,
        dominantWeatherCondition: weatherData.summary.dominantWeatherCondition,
        averageHumidity: weatherData.summary.averageHumidity ?? null, // Added average humidity to the summary
      };

      setWeatherSummary(summaryData);
      setHumidity(weatherData.humidity); // Assuming this is city-specific humidity
      checkForThresholdAlerts(weatherData.summary.maxTemp ?? 0); // Check alerts
      setError(null);
    } catch (error) {
      console.error(error);
      setError('City not found. Please try again.');
    }
  };

  // Send email alert
  const sendEmail = async (message: string) => {
    try {
      const response = await axios.post('/api/send-email', { message });
      console.log('Email sent successfully:', response.data);
    } catch (error) {
      console.error('Error sending email:', error);
    }
  };

  // Handle threshold checking and triggering alerts
  const checkForThresholdAlerts = (maxTemp: number) => {
    if (maxTemp >= temperatureThreshold) {
      const alertMessage = `Alert: Temperature exceeded ${temperatureThreshold}°C in ${city}. Current temperature is ${maxTemp}°C.`;
      setAlerts((prevAlerts) => [...prevAlerts, alertMessage]);
      sendEmail(alertMessage); // Call sendEmail function
    }
  };

  // Load threshold from localStorage on client side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedThreshold = localStorage.getItem('temperatureThreshold');
      if (savedThreshold) {
        setTemperatureThreshold(parseInt(savedThreshold));
      }
    }
  }, []);

  // Save threshold to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('temperatureThreshold', temperatureThreshold.toString());
    }
  }, [temperatureThreshold]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (city) {
      fetchWeatherData(city);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-300 to-blue-500 text-white p-4">
      <h1 className="text-3xl font-bold mb-4">Weather Forecast</h1>

      <form onSubmit={handleSubmit} className="flex flex-col items-center mb-6">
        <input
          type="text"
          placeholder="Enter a city"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="p-2 rounded-lg shadow-md text-black w-64 text-center focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
        <button type="submit" className="mt-4 bg-blue-600 p-2 rounded-lg w-32">
          Get Weather
        </button>
      </form>

      {error && <p className="text-red-600">{error}</p>}

      {/* Display today's temperature with icon */}
      {weatherSummary && (
        <div className="bg-white bg-opacity-20 rounded-lg p-4 m-2 shadow-lg w-80 text-center mb-4">
          <h3 className="text-xl">Today's Weather in {city}</h3>
          <div className="flex justify-center items-center space-x-4">
            {getWeatherIcon(weatherSummary.dominantWeatherCondition)}
            <p className="text-2xl">{weatherSummary.maxTemp?.toFixed(1)}°C</p>
          </div>
          <p className="text-lg">Today's Temperature: {weatherSummary.maxTemp?.toFixed(1)}°C</p>
        </div>
      )}

      {/* Threshold Input */}
      <div className="mb-6">
        <label htmlFor="threshold" className="text-lg">
          Set Temperature Threshold (°C):
        </label>
        <input
          type="number"
          id="threshold"
          value={temperatureThreshold}
          onChange={(e) => setTemperatureThreshold(Number(e.target.value))}
          className="p-2 ml-2 rounded-lg shadow-md text-black text-center focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
      </div>

      {globalSummary && (
        <div className="bg-white bg-opacity-20 rounded-lg p-4 m-2 shadow-lg w-80 text-center mb-4">
          <h3 className="text-xl">Weather Summary</h3>
          <p className="text-lg">
            Avg Temp: {globalSummary.averageTemp !== null ? globalSummary.averageTemp.toFixed(1) : 'N/A'}°C
          </p>
          <p className="text-lg">
            Max Temp: {globalSummary.maxTemp !== null ? globalSummary.maxTemp.toFixed(1) : 'N/A'}°C
          </p>
          <p className="text-lg">
            Min Temp: {globalSummary.minTemp !== null ? globalSummary.minTemp.toFixed(1) : 'N/A'}°C
          </p>
          <p className="text-lg">
            Avg Humidity: {globalSummary.averageHumidity !== null ? globalSummary.averageHumidity.toFixed(1) : 'N/A'}%
          </p>
          <p className="text-lg">Dominant Condition: {globalSummary.dominantWeatherCondition}</p>
        </div>
      )}

      {/* Humidity for the selected city */}
      {humidity !== null && (
        <div className="bg-white bg-opacity-20 rounded-lg p-4 m-2 shadow-lg w-80 text-center mb-4">
          <h3 className="text-xl">Humidity in {city}</h3>
          <p className="text-lg">{globalSummary.averageHumidity}%</p>
        </div>
      )}

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="bg-red-500 bg-opacity-20 rounded-lg p-4 m-2 shadow-lg w-80 text-center mb-4">
          <h3 className="text-xl">Alerts</h3>
          {alerts.map((alert, index) => (
            <p key={index} className="text-lg">{alert}</p>
          ))}
        </div>
      )}
    </div>
  );
};

export default WeatherApp;
