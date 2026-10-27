// API configuration
const API_KEY = 'YOUR_API_KEY_HERE'; // Replace with your actual API key
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

// DOM elements
const locationInput = document.getElementById('location-input');
const searchBtn = document.getElementById('search-btn');
const locationBtn = document.getElementById('location-btn');
const cityName = document.getElementById('city-name');
const currentDate = document.getElementById('current-date');
const currentTemp = document.getElementById('current-temp');
const weatherDescription = document.getElementById('weather-description');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('wind-speed');
const sunrise = document.getElementById('sunrise');
const sunset = document.getElementById('sunset');
const weatherIcon = document.getElementById('weather-icon');
const forecastItems = document.getElementById('forecast-items');
const loader = document.getElementById('loader');
const themeToggle = document.getElementById('theme-toggle');
const favoritesBtn = document.getElementById('favorites-btn');
const favoritesMenu = document.getElementById('favorites-menu');
const favoritesList = document.getElementById('favorites-list');
const closeFavorites = document.getElementById('close-favorites');
const addFavoriteBtn = document.getElementById('add-favorite');

// Weather icon mapping
const weatherIcons = {
    '01d': 'sun',          // clear sky (day)
    '01n': 'moon',         // clear sky (night)
    '02d': 'cloud-sun',    // few clouds (day)
    '02n': 'cloud-moon',   // few clouds (night)
    '03d': 'cloud',        // scattered clouds
    '03n': 'cloud',
    '04d': 'cloud',        // broken clouds
    '04n': 'cloud',
    '09d': 'cloud-rain',   // shower rain
    '09n': 'cloud-rain',
    '10d': 'cloud-sun-rain', // rain (day)
    '10n': 'cloud-moon-rain', // rain (night)
    '11d': 'cloud-lightning', // thunderstorm
    '11n': 'cloud-lightning',
    '13d': 'snowflake',    // snow
    '13n': 'snowflake',
    '50d': 'fog',          // mist/fog
    '50n': 'fog'
};

// Current city data
let currentCity = null;
let favorites = JSON.parse(localStorage.getItem('weatherFavorites')) || [];

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    // Load theme preference
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.setAttribute('data-theme', savedTheme);
    
    // Load favorites
    updateFavoritesList();
    
    // Show loading state
    showLoader();
    
    // Try to get user's location automatically
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                const { latitude, longitude } = position.coords;
                getWeatherByCoords(latitude, longitude);
            },
            error => {
                console.log("Geolocation error:", error);
                // Default to a popular city if location access is denied
                getWeatherByCity('London');
            }
        );
    } else {
        // Default to a popular city if geolocation is not supported
        getWeatherByCity('London');
    }
});

// Event listeners
searchBtn.addEventListener('click', handleSearch);
locationInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSearch();
});
locationBtn.addEventListener('click', handleLocation);
themeToggle.addEventListener('click', toggleTheme);
favoritesBtn.addEventListener('click', toggleFavoritesMenu);
closeFavorites.addEventListener('click', toggleFavoritesMenu);
addFavoriteBtn.addEventListener('click', toggleFavorite);

function handleSearch() {
    const location = locationInput.value.trim();
    if (location) {
        getWeatherByCity(location);
    } else {
        alert("Please enter a city name");
    }
}

function handleLocation() {
    if (navigator.geolocation) {
        showLoader();
        cityName.textContent = "Detecting location...";
        
        navigator.geolocation.getCurrentPosition(
            position => {
                const { latitude, longitude } = position.coords;
                getWeatherByCoords(latitude, longitude);
            },
            error => {
                console.log("Geolocation error:", error);
                hideLoader();
                alert("Unable to retrieve your location. Please enable location services or enter a city manually.");
            }
        );
    } else {
        alert("Geolocation is not supported by your browser. Please enter a city manually.");
    }
}

// Fetch weather by city name
async function getWeatherByCity(city) {
    try {
        showLoader();
        currentTemp.textContent = "--";
        weatherDescription.textContent = "--";
        
        // First get coordinates from city name (more reliable)
        const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=${API_KEY}`;
        const geoResponse = await fetch(geoUrl);
        
        if (!geoResponse.ok) {
            throw new Error(`API error: ${geoResponse.status}`);
        }
        
        const geoData = await geoResponse.json();
        
        if (!geoData || geoData.length === 0) {
            throw new Error("City not found. Please check the spelling.");
        }
        
        // Get weather using coordinates
        const { lat, lon } = geoData[0];
        currentCity = {
            name: geoData[0].name,
            country: geoData[0].country,
            lat,
            lon
        };
        
        await getWeatherByCoords(lat, lon);
        
        // Update favorite button state
        updateFavoriteButton();
        
    } catch (error) {
        console.error("Error in getWeatherByCity:", error);
        showError(error.message);
    } finally {
        hideLoader();
    }
}

// Fetch weather by coordinates
async function getWeatherByCoords(lat, lon) {
    try {
        showLoader();
        
        // Fetch current weather
        const currentWeatherUrl = `${BASE_URL}/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;
        const currentResponse = await fetch(currentWeatherUrl);
        
        if (!currentResponse.ok) {
            const errorData = await currentResponse.json();
            throw new Error(errorData.message || 'Failed to fetch weather data');
        }
        
        const currentData = await currentResponse.json();
        
        // Set current city
        currentCity = {
            name: currentData.name,
            country: currentData.sys.country,
            lat: currentData.coord.lat,
            lon: currentData.coord.lon
        };
        
        // Fetch forecast
        const forecastUrl = `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;
        const forecastResponse = await fetch(forecastUrl);
        
        if (!forecastResponse.ok) {
            throw new Error('Failed to fetch forecast data');
        }
        
        const forecastData = await forecastResponse.json();
        
        updateWeatherUI(currentData, forecastData);
        updateFavoriteButton();
        
    } catch (error) {
        console.error("Error in getWeatherByCoords:", error);
        showError(error.message);
    } finally {
        hideLoader();
    }
}

// Update the UI with weather data
function updateWeatherUI(currentData, forecastData) {
    // Update current weather
    cityName.textContent = `${currentData.name}, ${currentData.sys.country}`;
    
    const now = new Date();
    currentDate.textContent = now.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    
    currentTemp.textContent = Math.round(currentData.main.temp);
    weatherDescription.textContent = currentData.weather[0].description;
    humidity.textContent = `${currentData.main.humidity}%`;
    windSpeed.textContent = `${Math.round(currentData.wind.speed * 3.6)} km/h`;
    
    const sunriseTime = new Date(currentData.sys.sunrise * 1000);
    sunrise.textContent = sunriseTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const sunsetTime = new Date(currentData.sys.sunset * 1000);
    sunset.textContent = sunsetTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Update weather icon
    const iconCode = currentData.weather[0].icon;
    weatherIcon.innerHTML = getWeatherIconSVG(iconCode);
    
    // Update forecast
    updateForecastUI(forecastData);
    
    // Clear search input
    locationInput.value = '';
}

// Update forecast UI
function updateForecastUI(forecastData) {
    // Clear previous forecast
    forecastItems.innerHTML = '';
    
    // Group forecast by day
    const dailyForecast = {};
    forecastData.list.forEach(item => {
        const date = new Date(item.dt * 1000);
        const day = date.toLocaleDateString('en-US', { weekday: 'short' });
        
        if (!dailyForecast[day]) {
            dailyForecast[day] = {
                temp_max: item.main.temp_max,
                temp_min: item.main.temp_min,
                icon: item.weather[0].icon,
                description: item.weather[0].description
            };
        } else {
            if (item.main.temp_max > dailyForecast[day].temp_max) {
                dailyForecast[day].temp_max = item.main.temp_max;
            }
            if (item.main.temp_min < dailyForecast[day].temp_min) {
                dailyForecast[day].temp_min = item.main.temp_min;
            }
        }
    });
    
    // Display forecast for next 5 days
    const days = Object.keys(dailyForecast).slice(0, 5);
    days.forEach(day => {
        const forecast = dailyForecast[day];
        
        const forecastItem = document.createElement('div');
        forecastItem.className = 'forecast-item';
        forecastItem.innerHTML = `
            <div class="forecast-day">${day}</div>
            <div class="forecast-icon">${getWeatherIconSVG(forecast.icon)}</div>
            <div class="forecast-temp">
                <span class="forecast-temp-max">${Math.round(forecast.temp_max)}°</span>
                <span class="forecast-temp-min">${Math.round(forecast.temp_min)}°</span>
            </div>
        `;
        
        forecastItems.appendChild(forecastItem);
    });
}

// Show error message
function showError(message) {
    cityName.textContent = "Error";
    weatherDescription.textContent = message || "Failed to get weather data";
    currentTemp.textContent = "--";
    humidity.textContent = "--%";
    windSpeed.textContent = "-- km/h";
    sunrise.textContent = "--:--";
    sunset.textContent = "--:--";
    forecastItems.innerHTML = '<div class="forecast-error">No forecast data available</div>';
}

// Toggle theme between light and dark
function toggleTheme() {
    const currentTheme = document.body.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
}

// Toggle favorites menu
function toggleFavoritesMenu() {
    favoritesMenu.classList.toggle('active');
}

// Update favorites list
function updateFavoritesList() {
    favoritesList.innerHTML = '';
    favorites.forEach(city => {
        const li = document.createElement('li');
        li.textContent = `${city.name}, ${city.country}`;
        li.addEventListener('click', () => {
            getWeatherByCoords(city.lat, city.lon);
            toggleFavoritesMenu();
        });
        favoritesList.appendChild(li);
    });
}

// Toggle favorite status for current city
function toggleFavorite() {
    if (!currentCity) return;
    
    const index = favorites.findIndex(
        city => city.lat === currentCity.lat && city.lon === currentCity.lon
    );
    
    if (index === -1) {
        // Add to favorites
        favorites.push(currentCity);
        addFavoriteBtn.classList.add('active');
    } else {
        // Remove from favorites
        favorites.splice(index, 1);
        addFavoriteBtn.classList.remove('active');
    }
    
    localStorage.setItem('weatherFavorites', JSON.stringify(favorites));
    updateFavoritesList();
}

// Update favorite button state
function updateFavoriteButton() {
    if (!currentCity) {
        addFavoriteBtn.classList.remove('active');
        return;
    }
    
    const isFavorite = favorites.some(
        city => city.lat === currentCity.lat && city.lon === currentCity.lon
    );
    
    if (isFavorite) {
        addFavoriteBtn.classList.add('active');
    } else {
        addFavoriteBtn.classList.remove('active');
    }
}

// Show loader
function showLoader() {
    loader.style.display = 'flex';
}

// Hide loader
function hideLoader() {
    loader.style.display = 'none';
}

// Get SVG icon based on weather condition
function getWeatherIconSVG(iconCode) {
    const iconName = weatherIcons[iconCode] || 'cloud';
    
    const icons = {
        'sun': `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`,
        'moon': `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`,
        'cloud-sun': `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v2"></path><path d="m4.93 4.93 1.41 1.41"></path><path d="M20 12h2"></path><path d="m19.07 4.93-1.41 1.41"></path><path d="M15.947 12.65a4 4 0 0 0-5.925-4.128"></path><path d="M3 20a5 5 0 1 1 8.9-4H13a3 3 0 0 1 0 6Z"></path><path d="M11 20v2"></path><path d="M7 19v2"></path></svg>`,
        'cloud-moon': `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 22H7a5 5 0 1 1 4.9-6H13a3 3 0 0 1 0 6Z"></path><path d="M10.083 9A6.002 6.002 0 0 1 16 4a4.24 4.24 0 0 0 6 6 6 6 0 0 1-3 5.197"></path></svg>`,
        'cloud': `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"></path></svg>`,
        'cloud-rain': `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"></path><path d="M16 14v6"></path><path d="M8 14v6"></path><path d="M12 16v6"></path></svg>`,
        'cloud-sun-rain': `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v2"></path><path d="m4.93 4.93 1.41 1.41"></path><path d="M20 12h2"></path><path d="m19.07 4.93-1.41 1.41"></path><path d="M15.947 12.65a4 4 0 0 0-5.925-4.128"></path><path d="M13 22H7a5 5 0 1 1 4.9-6H13a3 3 0 0 1 0 6Z"></path><path d="M12 14v6"></path><path d="M8 16v6"></path><path d="M16 16v6"></path></svg>`,
        'cloud-moon-rain': `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.083 9A6.002 6.002 0 0 1 16 4a4.24 4.24 0 0 0 6 6 6 6 0 0 1-3 5.197"></path><path d="M13 22H7a5 5 0 1 1 4.9-6H13a3 3 0 0 1 0 6Z"></path><path d="M12 14v6"></path><path d="M8 16v6"></path><path d="M16 16v6"></path></svg>`,
        'cloud-lightning': `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"></path><path d="M13 11 9 17h4l-2 4"></path></svg>`,
        'snowflake': `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="2" y1="12" x2="22" y2="12"></line><line x1="12" y1="2" x2="12" y2="22"></line><path d="m20 16-4-4 4-4"></path><path d="m4 8 4 4-4 4"></path><path d="m16 4-4 4-4-4"></path><path d="m8 20 4-4 4 4"></path></svg>`,
        'fog': `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h16"></path><path d="M4 18h16"></path><path d="M4 6h16"></path></svg>`
    };
    
    return icons[iconName] || icons['cloud'];
}
