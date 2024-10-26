import { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

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

  // Prepare data for the line chart
  const chartData = {
    labels: dailyForecasts.map((f) => f.date),
    datasets: [
      {
        label: "Temperature (°C)",
        data: dailyForecasts.map((f) => f.avgTemp),
        fill: false,
        backgroundColor: "rgba(75,192,192,1)",
        borderColor: "rgba(75,192,192,1)",
        tension: 0.1, // To add a slight curve to the line
      },
    ],
  };
  const chartOptions = {
    plugins: {
      legend: {
        display: true, // Hide the legend
        labels: {
          color: "white", // Change legend text color
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            return `${context.raw.toFixed(1)}°C`;
          },
        },
        titleColor: "white", // Change tooltip title color
        bodyColor: "white", // Change tooltip body color
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: "Temperature (°C)",
          color: "white", // Change y-axis title color
        },
        ticks: {
          color: "white", // Change y-axis tick color
        },
      },
      x: {
        title: {
          display: true,
          text: "Date",
          color: "white", // Change x-axis title color
        },
        ticks: {
          color: "white", // Change x-axis tick color
        },
      },
    },
  };

  return (
    <div className="border-2 border-red-600 w-full h-full  flex flex-col lg:flex-row ">
      {/* Left side */}
      <div className="col-span-3 w-full flex flex-col items-center justify-center lg:p-8 pb-2">
        <div className=" lg:py-6 pt-6 pb-4 text-center">
          {/* Location */}
          {weather.name && weather.sys && (
            <p className="text-2xl">{`${weather.name}, ${weather.sys.country}`}</p>
          )}
        </div>
        {/* Search box */}
        <div className="w-2/3 flex items-center justify-center space-x-2 md:mb-4">
          <input
            type="text"
            placeholder="Enter City/Town..."
            onChange={(e) => setSearch(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                searchPressed();
              }
            }}
            className="px-4 py-2 border outline-purple-500 rounded-md flex-grow capitalize text-blue-800"
          />
          <button
            onClick={searchPressed}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
          >
            Search
          </button>
        </div>
        {/* Display local time */}
        {localTime && (
          <p className="lg:mt-4 text-md lg:text-lg font-semibold">
            {localTime}
          </p>
        )}

        {/* Weather Condition */}
        {weather.weather && weather.weather[0] && (
          <>
            <div className="flex items-center">
              {/* Weather Icon */}
              <img
                src={`http://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
                alt={weather.weather[0].description}
                className="mx-auto lg:w-[150px] lg:h-[150px]"
              />
              {/* Temperature */}
              {weather.main && (
                <p className="md:text-4xl text-lg font-bold">{`${weather.main.temp}°C`}</p>
              )}
            </div>

            <b className="mb:text-4xl text-3xl lg:mb-4">
              {weather.weather[0].main}
            </b>
            <p className="mb:text-3xl text-2xl ">
              {weather.weather[0].description}
            </p>
          </>
        )}
      </div>

      {/* Right side */}
      <div className="col-span-4 w-full border-2 border-red-600 flex flex-col justify-center lg:p-4 ">
        {/* 5-Day Forecast */}
        <div className="mt-6">
          <h2 className="text-2xl text-center font-bold">5-Day Forecast</h2>
          <div className="lg:flex justify-center w-full gap-4 mt-4  grid grid-cols-3 md:grid-cols-4  px-2 ">
            {dailyForecasts.map((f, index) => (
              <div
                key={index}
                className="flex items-center justify-center border p-2 "
                style={{
                  backgroundColor:
                    index === 0 ? "#2699E3" : "rgba(255, 255, 255, 0.3)",
                  color: index === 0 ? "white" : "black",
                  backdropFilter: "blur(10px)",
                  borderRadius: "16px",
                  boxShadow: "0 4px 30px rgba(0, 0, 0, 0.2)",
                  border:
                    index === 0 ? "none" : "1px solid rgba(255, 255, 255, 0.5)",
                }}
              >
                {/* Show "Today" for the first item */}
                <div
                  className=" 
                flex justify-center flex-col items-center text-center mx-auto  sm:[w-50px] md:w-[120px] lg:w-20 xl:w-24 2xl:w-28"
                >
                  <p className="font-semibold ">
                    {index === 0 ? "Today" : f.date}
                  </p>
                  <img
                    src={`http://openweathermap.org/img/wn/${f.icon}@2x.png`}
                    alt={f.description}
                    className="w-16 h-16 mr-2"
                  />
                  <p>{`${f.avgTemp.toFixed(1)}°C`}</p>
                  <p>{f.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Line chart for the forecast */}
        <div className=" chart-container">
          <h2 className="text-xl font-bold">Temperature Trend</h2>
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
}
