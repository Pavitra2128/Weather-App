// WeatherGraph.tsx
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';

interface WeatherData {
  name: string;
  avgTemp: number | null;
  maxTemp: number | null;
  minTemp: number | null;
  avgHumidity: number | null;
}

interface WeatherGraphProps {
  data: WeatherData[];
}

const WeatherGraph: React.FC<WeatherGraphProps> = ({ data }) => {
  return (
    <BarChart
      width={400}
      height={300}
      data={data}
      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      style={{ backgroundColor: '#333' }} // Dark background for the chart
    >
      <CartesianGrid strokeDasharray="3 3" stroke="#444" />
      <XAxis dataKey="name" stroke="#fff" />
      <YAxis stroke="#fff" />
      <Tooltip />
      <Legend />
      <Bar dataKey="avgTemp" fill="#8884d8" />
      <Bar dataKey="maxTemp" fill="#82ca9d" />
      <Bar dataKey="minTemp" fill="#ffc658" />
      <Bar dataKey="avgHumidity" fill="#ff7300" />
    </BarChart>
  );
};

export default WeatherGraph;
