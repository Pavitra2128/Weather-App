import mongoose, { Document, Schema } from 'mongoose';
import connectToDatabase from '../lib/mongodb';

// Define the weather summary interface
interface IWeatherSummary extends Document {
    date: string; // Format: YYYY-MM-DD
    averageTemp: number; // Average temperature for the day
    maxTemp: number; // Maximum temperature for the day
    minTemp: number; // Minimum temperature for the day
    dominantWeatherCondition: string; // Description of the main weather condition
}

// Define the schema for the weather summary
const WeatherSummarySchema: Schema = new mongoose.Schema({
    date: { type: String, required: true, unique: true }, // Ensure date is unique
    averageTemp: { type: Number, required: true },
    maxTemp: { type: Number, required: true },
    minTemp: { type: Number, required: true },
    dominantWeatherCondition: { type: String, required: true },
});

// Create a method to calculate the summary based on an array of weather data
WeatherSummarySchema.statics.createSummary = async function(weatherData: any[]) {
    const totalTemp = weatherData.reduce((acc, curr) => acc + curr.main.temp, 0);
    const maxTemp = Math.max(...weatherData.map(data => data.main.temp));
    const minTemp = Math.min(...weatherData.map(data => data.main.temp));
    
    const averageTemp = totalTemp / weatherData.length;
    
    // Determine the dominant weather condition based on frequency
    const conditionCounts: Record<string, number> = {};
    weatherData.forEach(data => {
        const condition = data.weather[0].main;
        conditionCounts[condition] = (conditionCounts[condition] || 0) + 1;
    });
    
    const dominantWeatherCondition = Object.keys(conditionCounts).reduce((a, b) => 
        conditionCounts[a] > conditionCounts[b] ? a : b
    );

    const summary = new this({
        date: new Date().toISOString().split('T')[0], // Format as YYYY-MM-DD
        averageTemp,
        maxTemp,
        minTemp,
        dominantWeatherCondition,
    });

    await summary.save();
    return summary;
};

// Method to fetch the latest summary
WeatherSummarySchema.statics.getLatestSummary = async function() {
    return await this.findOne().sort({ date: -1 }); // Get the latest summary by date
};

// Function to get the model after ensuring the database is connected
const getWeatherSummaryModel = async () => {
    await connectToDatabase(); // Ensure that MongoDB is connected
    return mongoose.models.WeatherSummary || mongoose.model<IWeatherSummary>('WeatherSummary', WeatherSummarySchema);
};

export default getWeatherSummaryModel;
