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
        res.status(200).json(weatherData);
    } catch (error) {
        console.error('Error fetching weather data:', error);
        res.status(500).json({ error: 'Error fetching weather data' });
    }
};
