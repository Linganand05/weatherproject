const apiKey = "17979f41718e81f87596320b69c4ea01";
const apiUrl = "https://api.openweathermap.org/data/2.5/weather?units=metric&q=";
const forecastUrl = "https://api.openweathermap.org/data/2.5/forecast?units=metric&q=";

const searchInput = document.querySelector("input");
const searchButton = document.querySelector("button");
const weatherIcon = document.getElementById("weather-icon");
const errorMessage = document.getElementById("error-message");
const weatherInfo = document.getElementById("weather-info");
const temperature = document.getElementById("temperature");
const cityName = document.getElementById("city");
const humidity = document.getElementById("humidity");
const windSpeed = document.getElementById("wind-speed");
const recentCitiesDropdown = document.getElementById("recent-cities");
const forecastContainer = document.getElementById("forecast-container");

// Function to fetch weather by city name
async function fetchWeather(city) {
  try {
    const response = await fetch(`${apiUrl}${city}&appid=${apiKey}`);
    if (response.status === 404) {
      errorMessage.classList.remove("hidden");
      weatherInfo.classList.add("hidden");
    } else {
      const data = await response.json();
      cityName.textContent = data.name;
      temperature.textContent = `${Math.round(data.main.temp)}°C`;
      humidity.textContent = `${data.main.humidity}%`;
      windSpeed.textContent = `${data.wind.speed} km/h`;

      const weatherCondition = data.weather[0].main;
      if (weatherCondition === "Clouds") {
        weatherIcon.src = "images/clouds.png";
      } else if (weatherCondition === "Clear") {
        weatherIcon.src = "images/clear.png";
      } else if (weatherCondition === "Rain") {
        weatherIcon.src = "images/rain.png";
      } else if (weatherCondition === "Drizzle") {
        weatherIcon.src = "images/drizzle.png";
      } else if (weatherCondition === "Mist") {
        weatherIcon.src = "images/mist.png";
      }

      errorMessage.classList.add("hidden");
      weatherInfo.classList.remove("hidden");

      fetchExtendedForecast(city); // Fetch 5-day extended forecast
      addToRecentCities(city); // Add city to recent search list
    }
  } catch (error) {
    errorMessage.textContent = "Failed to fetch weather data. Please try again.";
    errorMessage.classList.remove("hidden");
    weatherInfo.classList.add("hidden");
  }
}

// Function to fetch extended 5-day forecast data
async function fetchExtendedForecast(city) {
  try {
    const response = await fetch(`${forecastUrl}${city}&appid=${apiKey}`);
    const data = await response.json();
    
    // Clear previous forecasts
    forecastContainer.innerHTML = "";

    // Display forecast data
    data.list.forEach((forecast, index) => {
      if (index % 8 === 0) { // Get one forecast for each day (8 times per day in the forecast data)
        const date = new Date(forecast.dt * 1000);
        const forecastElement = document.createElement("div");
        forecastElement.classList.add("bg-teal-800", "rounded-lg", "p-4", "text-white", "flex", "flex-col", "items-center", "w-32", "sm:w-40");

        const weatherCondition = forecast.weather[0].main;
        let iconSrc = "";
        if (weatherCondition === "Clouds") {
          iconSrc = "images/clouds.png";
        } else if (weatherCondition === "Clear") {
          iconSrc = "images/clear.png";
        } else if (weatherCondition === "Rain") {
          iconSrc = "images/rain.png";
        } else if (weatherCondition === "Drizzle") {
          iconSrc = "images/drizzle.png";
        } else if (weatherCondition === "Mist") {
          iconSrc = "images/mist.png";
        }

        forecastElement.innerHTML = `
          <img src="${iconSrc}" alt="Weather Icon" class="w-12 h-12">
          <p class="text-lg mt-2">${date.toLocaleDateString()}</p>
          <p class="text-sm">${Math.round(forecast.main.temp)}°C</p>
          <p class="text-xs">Wind: ${forecast.wind.speed} km/h</p>
          <p class="text-xs">Humidity: ${forecast.main.humidity}%</p>
        `;
        forecastContainer.appendChild(forecastElement);
      }
    });
  } catch (error) {
    console.error("Error fetching forecast:", error);
  }
}

// Add city to recently searched cities dropdown
function addToRecentCities(city) {
  let recentCities = JSON.parse(localStorage.getItem("recentCities")) || [];
  if (!recentCities.includes(city)) {
    recentCities.push(city);
    if (recentCities.length > 5) recentCities.shift(); // Keep only the last 5 cities
    localStorage.setItem("recentCities", JSON.stringify(recentCities));
    updateRecentCitiesDropdown();
  }
}

// Update the recent cities dropdown
function updateRecentCitiesDropdown() {
  let recentCities = JSON.parse(localStorage.getItem("recentCities")) || [];
  if (recentCities.length > 0) {
    recentCitiesDropdown.classList.remove("hidden");
    recentCitiesDropdown.innerHTML = "<option value='' disabled selected>Select recently searched city</option>";
    recentCities.forEach(city => {
      const option = document.createElement("option");
      option.value = city;
      option.textContent = city;
      recentCitiesDropdown.appendChild(option);
    });
  } else {
    recentCitiesDropdown.classList.add("hidden");
  }
}

// Event listener for the search button
searchButton.addEventListener("click", () => {
  const city = searchInput.value.trim();
  if (city) {
    fetchWeather(city);
  }
});

// Event listener for selecting a city from the dropdown
recentCitiesDropdown.addEventListener("change", (e) => {
  const selectedCity = e.target.value;
  if (selectedCity) {
    fetchWeather(selectedCity);
  }
});

// Initial setup: Update dropdown with recent cities
updateRecentCitiesDropdown();

// Event listener for fetching current location weather
const currentLocationButton = document.createElement('button');
currentLocationButton.textContent = "Use Current Location";
currentLocationButton.classList.add("mt-4", "bg-teal-50", "rounded-full", "w-full", "h-12", "sm:h-14", "text-sm", "sm:text-lg", "outline-none", "text-gray-800");
document.querySelector('.w-full').appendChild(currentLocationButton);

currentLocationButton.addEventListener("click", () => {
  fetchCurrentLocationWeather();
});

// Function to fetch weather based on current location
async function fetchCurrentLocationWeather() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      try {
        const response = await fetch(`${apiUrl}lat=${lat}&lon=${lon}&appid=${apiKey}`);
        const data = await response.json();
        cityName.textContent = data.name;
        temperature.textContent = `${Math.round(data.main.temp)}°C`;
        humidity.textContent = `${data.main.humidity}%`;
        windSpeed.textContent = `${data.wind.speed} km/h`;

        const weatherCondition = data.weather[0].main;
        if (weatherCondition === "Clouds") {
          weatherIcon.src = "images/clouds.png";
        } else if (weatherCondition === "Clear") {
          weatherIcon.src = "images/clear.png";
        } else if (weatherCondition === "Rain") {
          weatherIcon.src = "images/rain.png";
        } else if (weatherCondition === "Drizzle") {
          weatherIcon.src = "images/drizzle.png";
        } else if (weatherCondition === "Mist") {
          weatherIcon.src = "images/mist.png";
        }

        errorMessage.classList.add("hidden");
        weatherInfo.classList.remove("hidden");

        fetchExtendedForecastFromLocation(lat, lon); // Fetch 5-day forecast based on location
      } catch (error) {
        errorMessage.textContent = "Failed to fetch weather data. Please try again.";
        errorMessage.classList.remove("hidden");
        weatherInfo.classList.add("hidden");
      }
    }, (error) => {
      errorMessage.textContent = "Geolocation permission denied. Please allow location access.";
      errorMessage.classList.remove("hidden");
      weatherInfo.classList.add("hidden");
    });
  } else {
    errorMessage.textContent = "Geolocation is not supported by this browser.";
    errorMessage.classList.remove("hidden");
    weatherInfo.classList.add("hidden");
  }
}

// Function to fetch extended 5-day forecast based on current location
async function fetchExtendedForecastFromLocation(lat, lon) {
  try {
    const response = await fetch(`${forecastUrl}lat=${lat}&lon=${lon}&appid=${apiKey}`);
    const data = await response.json();
    
    // Clear previous forecasts
    forecastContainer.innerHTML = "";

    // Display forecast data
    data.list.forEach((forecast, index) => {
      if (index % 8 === 0) { // Get one forecast for each day (8 times per day in the forecast data)
        const date = new Date(forecast.dt * 1000);
        const forecastElement = document.createElement("div");
        forecastElement.classList.add("bg-teal-800", "rounded-lg", "p-4", "text-white", "flex", "flex-col", "items-center", "w-32", "sm:w-40");

        const weatherCondition = forecast.weather[0].main;
        let iconSrc = "";
        if (weatherCondition === "Clouds") {
          iconSrc = "images/clouds.png";
        } else if (weatherCondition === "Clear") {
          iconSrc = "images/clear.png";
        } else if (weatherCondition === "Rain") {
          iconSrc = "images/rain.png";
        } else if (weatherCondition === "Drizzle") {
          iconSrc = "images/drizzle.png";
        } else if (weatherCondition === "Mist") {
          iconSrc = "images/mist.png";
        }

        forecastElement.innerHTML = `
          <img src="${iconSrc}" alt="Weather Icon" class="w-12 h-12">
          <p class="text-lg mt-2">${date.toLocaleDateString()}</p>
          <p class="text-sm">${Math.round(forecast.main.temp)}°C</p>
          <p class="text-xs">Wind: ${forecast.wind.speed} km/h</p>
          <p class="text-xs">Humidity: ${forecast.main.humidity}%</p>
        `;
        forecastContainer.appendChild(forecastElement);
      }
    });
  } catch (error) {
    console.error("Error fetching forecast:", error);
  }
}
