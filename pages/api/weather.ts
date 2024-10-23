import axios from 'axios';
import type { NextApiRequest, NextApiResponse } from 'next';

const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

export default async (req: NextApiRequest, res: NextApiResponse) => {
    const cities = ['Chennai', 'Mumbai', 'Delhi', 'Kolkata', 'Bangalore', 'Hyderabad'];
    try {
        const weatherPromises = cities.map(city =>
            axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city},IN&appid=${API_KEY}`)
        );
        const responses = await Promise.all(weatherPromises);
        const weatherData = responses.map(response => response.data);

        // Calculate summary
        const summary = {
            averageTemp: null,
            maxTemp: null,
            minTemp: null,
            dominantWeatherCondition: null,
            averageHumidity: null,
        };

        let totalTemp = 0;
        let totalHumidity = 0;
        let maxTemp = -Infinity;
        let minTemp = Infinity;
        let conditionCounts: Record<string, number> = {};

        weatherData.forEach(data => {
            const temp = data.main.temp - 273.15; // Convert from Kelvin to Celsius
            const humidity = data.main.humidity; // Fetch humidity
            totalTemp += temp;
            totalHumidity += humidity; // Accumulate humidity
            if (temp > maxTemp) maxTemp = temp;
            if (temp < minTemp) minTemp = temp;

            const condition = data.weather[0].main;
            conditionCounts[condition] = (conditionCounts[condition] || 0) + 1;
        });

        summary.averageTemp = totalTemp / weatherData.length;
        summary.averageHumidity = totalHumidity / weatherData.length; // Average humidity
        summary.maxTemp = maxTemp;
        summary.minTemp = minTemp;

        // Find dominant weather condition
        summary.dominantWeatherCondition = Object.entries(conditionCounts).reduce((a, b) => b[1] > a[1] ? b : a)[0];

        res.status(200).json({ summary });
    } catch (error) {
        console.error('Error fetching weather data:', error);
        res.status(500).json({ error: 'Error fetching weather data' });
    }
};
