import { useState, useEffect } from "react";

const api = {
  key: "edec11bce02f2c92262d9c75b8c7d47a",
  base: "https://api.openweathermap.org/data/2.5/",
};

export default function App() {
  const [search, setSearch] = useState("");
  const [weather, setWeather] = useState({});
  const [forecast, setForecast] = useState([]);
  const [localTime, setLocalTime] = useState("");

  // Function to fetch current weather data based on the city name
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
        calculateLocalTime(result.timezone); // Calculate the local time after receiving weather data
        fetchForecast(city); // Fetch forecast for the city
      })
      .catch((error) => console.error("Error fetching weather data:", error));
  };

  // Function to fetch the 5-day weather forecast
  const fetchForecast = (city) => {
    fetch(`${api.base}forecast?q=${city}&units=metric&APPID=${api.key}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Error: ${res.status} ${res.statusText}`);
        }
        return res.json();
      })
      .then((result) => {
        setForecast(result.list); // Set the forecast data
      })
      .catch((error) => console.error("Error fetching forecast data:", error));
  };

  // Function to calculate local time using timezone offset
  const calculateLocalTime = (timezoneOffset) => {
    const now = new Date();
    const utcTime = now.getTime() + now.getTimezoneOffset() * 60000; // Convert to UTC in milliseconds
    const cityTime = new Date(utcTime + timezoneOffset * 1000); // Convert timezone offset from seconds to milliseconds

    // Format the time using Intl.DateTimeFormat
    const formattedTime = new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(cityTime);

    setLocalTime(formattedTime);
  };

  // Fetch weather for a default city (e.g., "Manila") when the app loads
  useEffect(() => {
    fetchWeather("Manila"); // Change "Manila" to any city you want as default
  }, []);

  // Handle search button press
  const searchPressed = () => {
    fetchWeather(search);
  };

  // Function to get daily forecasts
  const getDailyForecasts = () => {
    const dailyForecasts = {};
    forecast.forEach((f) => {
      const date = new Date(f.dt * 1000).toLocaleDateString();
      if (!dailyForecasts[date]) {
        dailyForecasts[date] = [];
      }
      dailyForecasts[date].push(f);
    });

    return Object.entries(dailyForecasts).map(([date, forecasts]) => {
      const avgTemp =
        forecasts.reduce((sum, f) => sum + f.main.temp, 0) / forecasts.length;
      const mainWeather = forecasts[0].weather[0];
      return {
        date,
        avgTemp,
        icon: mainWeather.icon,
        description: mainWeather.description,
      };
    });
  };

  const dailyForecasts = getDailyForecasts();

  return (
    <div className="border-2 border-red-600 w-full h-full grid grid-cols-7 gap-4">
      {/* Left side */}
      <div className="col-span-3 w-full flex flex-col items-center justify-center">
        {/* Search box */}
        <div className="w-2/3 flex items-center justify-center space-x-2 mb-4">
          <input
            type="text"
            placeholder="Enter City/Town..."
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 border outline-purple-500 rounded-md flex-grow text-purple-600"
          />
          <button
            onClick={searchPressed}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
          >
            Search
          </button>
        </div>
        {/* Display local time */}
        {localTime && <p className="mt-4 text-lg font-semibold">{localTime}</p>}

        {/* Condition */}
        {weather.weather && weather.weather[0] && (
          <>
            <div className="flex items-center">
              {/* Weather Icon */}
              <img
                src={`http://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
                alt={weather.weather[0].description}
                className="mx-auto"
                style={{ width: "150px", height: "150px" }}
              />
              {/* Temperature */}
              {weather.main && (
                <p className="text-4xl font-bold">{`${weather.main.temp}°C`}</p>
              )}
            </div>

            <b className="text-4xl mb-4">{weather.weather[0].main}</b>
            <p className="text-2xl">{weather.weather[0].description}</p>
          </>
        )}
      </div>

      {/* Right side */}
      <div className="col-span-4 w-full border-2 border-red-600 flex flex-col p-4">
        <div className="border-2 border-red-600 p-4 text-center">
          {/* Location */}
          {weather.name && weather.sys && (
            <p className="text-2xl">{`${weather.name}, ${weather.sys.country}`}</p>
          )}
        </div>
        {/* 5-Day Forecast */}
        // Inside the Right side div, replace the forecast rendering section
        with this:
        {/* 5-Day Forecast */}
        <div className="mt-4">
          <h2 className="text-xl font-bold">5-Day Forecast</h2>
          <div className="grid grid-cols-5 gap-4 mt-4">
            {dailyForecasts.map((f, index) => (
              <div
                key={index}
                className="flex items-center border p-2"
                style={{
                  backgroundColor: index === 0 ? "skyblue" : "transparent",
                  color: index === 0 ? "white" : "black",
                }}
              >
                {/* Show "Today" for the first item */}
                <div>
                  <p className="font-semibold">
                    {index === 0 ? "Today" : f.date}
                  </p>
                  <p>{`${f.avgTemp.toFixed(1)}°C`}</p>
                  <p>{f.description}</p>
                </div>
                <img
                  src={`http://openweathermap.org/img/wn/${f.icon}@2x.png`}
                  alt={f.description}
                  className="w-16 h-16 mr-2"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
