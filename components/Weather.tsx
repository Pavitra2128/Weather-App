import React, { useEffect, useState } from 'react';
import axios from 'axios';
import getWeatherSummaryModel from '../models/WeatherSummary'; // Import the model for summary

const Weather = () => {
    const API_KEY = process.env.NEXT_PUBLIC_API_KEY;
    const [dailyWeatherData, setDailyWeatherData] = useState<any[]>([]);
    const [dailySummaries, setDailySummaries] = useState<any[]>([]); // State for daily summaries
    const [isCelsius, setIsCelsius] = useState(true);

    const fetchWeatherData = async () => {
        console.log("Fetching weather data...");
        try {
            const cities = ['Chennai', 'Mumbai', 'Delhi', 'Kolkata', 'Bangalore', 'Hyderabad'];
            const weatherPromises = cities.map(city =>
                axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city},IN&appid=${API_KEY}`)
            );
            const responses = await Promise.all(weatherPromises);
            const currentWeatherData = responses.map(response => response.data);
            console.log("Weather data fetched successfully:", currentWeatherData);
            setDailyWeatherData(currentWeatherData);
        } catch (error) {
            console.error('Error fetching weather data:', error.response ? error.response.data : error.message);
        }
    };

    const toggleTemperatureUnit = () => {
        console.log(`Toggling temperature unit to ${isCelsius ? 'Fahrenheit' : 'Celsius'}`);
        setIsCelsius(!isCelsius);
    };

    const convertTemperature = (tempK: number) => {
        const temp = isCelsius ? (tempK - 273.15).toFixed(2) + ' °C' : ((tempK - 273.15) * 9 / 5 + 32).toFixed(2) + ' °F';
        console.log(`Converted temperature: ${temp}`);
        return temp;
    };

    useEffect(() => {
        console.log("Component mounted. Fetching weather data...");
        fetchWeatherData(); 
        const intervalId = setInterval(fetchWeatherData, 5 * 60 * 1000);
        return () => {
            clearInterval(intervalId);
            console.log("Cleanup: Interval cleared.");
        };
    }, []);

    const processDailySummary = async () => {
        console.log("Processing daily summary...");
        const dailySummary = dailyWeatherData.reduce((acc, data) => {
            const tempCelsius = data.main.temp - 273.15;
            const date = new Date(data.dt * 1000).toLocaleDateString(); 
            console.log(`Processing data for ${data.name}: Temp: ${tempCelsius}, Date: ${date}`);

            if (!acc[date]) {
                acc[date] = {
                    totalTemp: 0,
                    maxTemp: -Infinity,
                    minTemp: Infinity,
                    weatherConditions: {},
                    count: 0,
                };
            }

            acc[date].totalTemp += tempCelsius;
            acc[date].maxTemp = Math.max(acc[date].maxTemp, tempCelsius);
            acc[date].minTemp = Math.min(acc[date].minTemp, tempCelsius);
            acc[date].weatherConditions[data.weather[0].main] = (acc[date].weatherConditions[data.weather[0].main] || 0) + 1;
            acc[date].count += 1;

            return acc;
        }, {});

        console.log("Daily summary data processed:", dailySummary);

        const finalSummary = Object.entries(dailySummary).map(([date, { totalTemp, maxTemp, minTemp, weatherConditions, count }]) => {
            const averageTemp = totalTemp / count;
            const dominantWeatherCondition = Object.keys(weatherConditions).reduce((a, b) => weatherConditions[a] > weatherConditions[b] ? a : b);

            return {
                date,
                averageTemp,
                maxTemp,
                minTemp,
                dominantWeatherCondition,
            };
        });

        console.log("Final summary prepared:", finalSummary);

        // Save the daily summaries to the database
        try {
            const WeatherSummary = await getWeatherSummaryModel(); // Ensure model is connected
            await WeatherSummary.insertMany(finalSummary);
            console.log("Daily summaries saved to database:", finalSummary);
            setDailyWeatherData([]); // Clear daily weather data after saving
        } catch (error) {
            console.error('Error saving daily summary:', error);
        }

        // Set the summaries to display
        setDailySummaries(finalSummary);
    };

    useEffect(() => {
        // This effect will run every time dailyWeatherData changes
        if (dailyWeatherData.length > 0) {
            processDailySummary();
        }
    }, [dailyWeatherData]); // Removed the time check

    return (
        <div>
            <h1>Weather Data</h1>
            <button onClick={toggleTemperatureUnit}>
                Switch to {isCelsius ? 'Fahrenheit' : 'Celsius'}
            </button>
            <ul>
                {dailyWeatherData.map((data, index) => (
                    <li key={index}>
                        <h2>{data.name}</h2>
                        <p>Main Weather: {data.weather[0].main}</p>
                        <p>Temperature: {convertTemperature(data.main.temp)}</p>
                        <p>Feels Like: {convertTemperature(data.main.feels_like)}</p>
                        <p>Last Updated: {new Date(data.dt * 1000).toLocaleString()}</p>
                        <p>Humidity: {data.main.humidity} %</p>
                    </li>
                ))}
            </ul>

            {/* Daily Weather Summaries */}
            <h2>Daily Weather Summaries</h2>
            <ul>
                {dailySummaries.length > 0 ? (
                    dailySummaries.map((summary, index) => (
                        <li key={index}>
                            <h3>Date: {summary.date}</h3>
                            <p>Average Temperature: {summary.averageTemp.toFixed(2)} °C</p>
                            <p>Maximum Temperature: {summary.maxTemp.toFixed(2)} °C</p>
                            <p>Minimum Temperature: {summary.minTemp.toFixed(2)} °C</p>
                            <p>Dominant Weather Condition: {summary.dominantWeatherCondition}</p>
                        </li>
                    ))
                ) : (
                    <p>No summaries available yet.</p>
                )}
            </ul>
        </div>
    );
};

export default Weather;
