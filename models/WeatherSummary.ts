import mongoose, { Document, Schema } from 'mongoose';

// Define the interface for your weather summary document
interface IWeatherSummary extends Document {
    date: string; // Format: YYYY-MM-DD
    averageTemp: number;
    maxTemp: number;
    minTemp: number;
    dominantWeatherCondition: string;
}

const WeatherSummarySchema: Schema<IWeatherSummary> = new mongoose.Schema({
    date: { type: String, required: true, unique: true },
    averageTemp: { type: Number, required: true },
    maxTemp: { type: Number, required: true },
    minTemp: { type: Number, required: true },
    dominantWeatherCondition: { type: String, required: true },
});

// Database connection logic
async function connectToDatabase() {
    console.log("Mongoose Connection State (before):", mongoose.connection.readyState);
    if (mongoose.connection.readyState === 0) {
        try {
            await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
            console.log("MongoDB connected successfully");
        } catch (error) {
            console.error("MongoDB connection error:", error);
            throw new Error("Failed to connect to MongoDB");
        }
    }
    console.log("Mongoose Connection State (after):", mongoose.connection.readyState);
}

// Get the WeatherSummary model
async function getWeatherSummaryModel() {
    await connectToDatabase();
    return mongoose.models.WeatherSummary || mongoose.model<IWeatherSummary>('WeatherSummary', WeatherSummarySchema);
}

// Export the model directly
export default getWeatherSummaryModel;
