import { useState, useEffect } from "react";

const api = {
  key: "edec11bce02f2c92262d9c75b8c7d47a",
  base: "https://api.openweathermap.org/data/2.5/",
};

export default function App() {
  const [search, setSearch] = useState("");
  const [weather, setWeather] = useState({});

  // Function to fetch weather data based on the city name
  const fetchWeather = (city) => {
    fetch(`${api.base}weather?q=${city}&units=metric&APPID=${api.key}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Error: ${res.status} ${res.statusText}`);
        }
        return res.json();
      })
      .then((result) => {
        setWeather(result);
        console.log(result);
      })
      .catch((error) => console.error("Error fetching weather data:", error));
  };

  // Fetch weather for a default city (e.g., "Manila") when the app loads
  useEffect(() => {
    fetchWeather("Manila");  // Change "Manila" to any city you want as default
  }, []);

  // Handle search button press
  const searchPressed = () => {
    fetchWeather(search);
  };

  return (
    <div className="border-2 border-red-600 w-full h-full grid grid-cols-7">
      {/* Left side */}
      <div className="col-span-4 w-full border-2">
        {/* Location */}
        {weather.name && weather.sys && (
          <p>{`${weather.name}, ${weather.sys.country}`}</p>
        )}

        {/* Temperature */}
        {weather.main && <p>{`${weather.main.temp}°C`}</p>}

        {/* Condition */}
        {weather.weather && weather.weather[0] && (
          <>
            <p>{weather.weather[0].main}</p>
            <p>{weather.weather[0].description}</p>
          </>
        )}
      </div>

      {/* Right side */}
      <div className="col-span-3 w-full">
        {/* Search box */}
        <input
          type="text"
          placeholder="Enter City/Town..."
          onChange={(e) => setSearch(e.target.value)}
        />
        <button onClick={searchPressed}>Search</button>
      </div>
    </div>
  );
}
