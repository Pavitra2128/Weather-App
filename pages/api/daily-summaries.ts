import type { NextApiRequest, NextApiResponse } from 'next';
import getWeatherSummaryModel from '../../models/WeatherSummary';

export default async (req: NextApiRequest, res: NextApiResponse) => {
    const WeatherSummary = await getWeatherSummaryModel();

    if (req.method === 'POST') {
        // Store daily summary
        try {
            const summaries = req.body;
            await WeatherSummary.insertMany(summaries);
            res.status(201).json({ message: 'Daily summaries saved successfully.' });
        } catch (error) {
            console.error('Error saving daily summaries:', error);
            res.status(500).json({ error: 'Error saving daily summaries' });
        }
    } else if (req.method === 'GET') {
        // Fetch daily summaries
        try {
            const summaries = await WeatherSummary.find(); // Adjust as necessary for your query
            res.status(200).json(summaries);
        } catch (error) {
            console.error('Error fetching daily summaries:', error);
            res.status(500).json({ error: 'Error fetching daily summaries' });
        }
    } else {
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
};
