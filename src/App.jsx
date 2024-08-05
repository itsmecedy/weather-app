import { useState } from "react";

const api = {
  key: "edec11bce02f2c92262d9c75b8c7d47a",
  base: "https://api.openweathermap.org/data/2.5/",
};

export default function App() {
  const [search, setSearch] = useState("");
  const [weather, setWeather] = useState({});

  const searchPressed = () => {
    fetch(`${api.base}weather?q=${search}&units=metric&APPID=${api.key}`)
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

  return (
    <>
      <div className="app-header "></div>
      <h1 className="text-3xl font-bold underline">Hello world!</h1>

      {/* Search box */}
      <div>
        <input
          type="text"
          placeholder="Enter City/Town..."
          onChange={(e) => setSearch(e.target.value)}
        />
        <button onClick={searchPressed}>Search</button>
      </div>

      {/* Location */}
      {weather.name && weather.sys && (
        <p>{`${weather.name}, ${weather.sys.country}`}</p>
      )}

      {/* Temperature */}
      {weather.main && <p>{`${weather.main.temp}°C`}</p>}

      {/* Condition */}
      {weather.weather && weather.weather[0] && (
        <p>{weather.weather[0].main}</p>
      )}
      {weather.weather && weather.weather[0] && (
        <p>{weather.weather[0].description}</p>
      )}
    </>
  );
}
