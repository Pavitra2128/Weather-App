import Weather from '../components/Weather';
import '../app/globals.css';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <Weather />
    </div>
  );
}
