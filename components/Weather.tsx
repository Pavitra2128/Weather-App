// components/Weather.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Weather = () => {
    const API_KEY = process.env.NEXT_PUBLIC_API_KEY; // Use the environment variable
    const [weatherData, setWeatherData] = useState<any[]>([]); // State to hold weather data

    const fetchWeatherData = async () => {
        try {
            const cities = ['Chennai', 'Mumbai', 'Delhi', 'Kolkata', 'Bangalore', 'Hyderabad'];
            const weatherPromises = cities.map(city =>
                axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city},IN&appid=${API_KEY}`)
            );
            const responses = await Promise.all(weatherPromises);
            setWeatherData(responses.map(response => response.data)); // Extract data from responses
        } catch (error) {
            console.error('Error fetching weather data:', error.response ? error.response.data : error.message);
        }
    };

    useEffect(() => {
        fetchWeatherData(); // Initial fetch
        const intervalId = setInterval(fetchWeatherData, 5 * 60 * 1000); // Fetch every 5 minutes
        return () => clearInterval(intervalId); // Cleanup on component unmount
    }, []);

    return (
        <div>
            <h1>Weather Data</h1>
            <ul>
                {weatherData.map((data, index) => (
                    <li key={index}>
                        <h2>{data.name}</h2>
                        <p>Temperature: {(data.main.temp - 273.15).toFixed(2)} °C</p>
                        <p>Weather: {data.weather[0].description}</p>
                        <p>Humidity: {data.main.humidity} %</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Weather;
