🌦️ Weather App

A modern, responsive weather application built with HTML, CSS, and JavaScript that provides current weather conditions and a 5-day forecast for cities around the world. It features location-based weather search, favorite cities, and a customizable light/dark theme.

✨ Features
🌍 City Search — Search for weather information by entering a city name.
📍 Current Location — Get weather updates for your current location using geolocation.
🌡️ Real-Time Weather — View current temperature and weather conditions.
💧 Humidity & Wind Speed — Check humidity levels and wind speed.
🌅 Sunrise & Sunset — View local sunrise and sunset times.
📅 5-Day Forecast — Explore upcoming weather conditions.
🌤️ Weather Icons — Visual indicators for different weather conditions.
⭐ Favorite Cities — Save and quickly access your favorite locations.
🌓 Light & Dark Mode — Switch between themes for a comfortable viewing experience.
💾 Local Storage — Retain saved favorites and theme preferences in your browser.
⏳ Loading Indicator — Display a loading state while weather data is being retrieved.
🛠️ Tech Stack
HTML5 — Structures the application.
CSS3 — Provides styling, layout, and theme customization.
JavaScript (Vanilla) — Handles application logic, API requests, and dynamic updates.
OpenWeatherMap API — Supplies weather information and forecast data.
Browser Geolocation API — Retrieves coordinates for location-based weather searches.
Local Storage API — Saves favorite cities and theme preferences.
📂 Project Structure
text
Weather-App/
├── index.html    # Application structure
├── styles.css    # Styling and responsive layout
├── script.js     # Weather API integration and app logic
├── deploy.yml    # Deployment workflow configuration
└── README.md     # Project documentation

🚀 Getting Started
Prerequisites
A modern web browser.
An internet connection.
An OpenWeatherMap API key.

🎮 How to Use
Open the Weather App in your browser.
Allow location access to retrieve weather for your current location, or enter a city name in the search bar.
Click the search button or press Enter to search for a city.
View the current temperature, weather conditions, humidity, wind speed, sunrise, and sunset.
Explore the 5-day forecast for upcoming weather conditions.
Add cities to your favorites for convenient access later.
Toggle between light and dark themes using the theme button.

Note: If location permission is denied or unavailable, the application attempts to display weather for London by default.

🔌 API Integration

This application uses the OpenWeatherMap API to retrieve weather information.

API documentation: OpenWeatherMap API

The API key must be valid and have access to the endpoints used by the application. Available data and request limits depend on your API plan.

Security note: The current frontend configuration uses a JavaScript API key placeholder. A key embedded in client-side JavaScript is visible to visitors. For a publicly deployed application, consider using a backend proxy or another appropriate method to protect your API credentials.

💡 Key Learning Outcomes

This project demonstrates practical experience with:

Fetching data from external APIs.
Working with asynchronous JavaScript.
Updating the DOM dynamically.
Using browser geolocation.
Managing application preferences with local storage.
Implementing interactive UI controls.
Creating light and dark themes with CSS.
Handling loading states and user input.
🔮 Future Improvements

Potential enhancements include:

Add a temperature unit switcher for Celsius and Fahrenheit.
Display hourly weather forecasts.
Add weather alerts and severe-weather notifications.
Improve error messages for invalid cities and API failures.
Add weather maps and air-quality information.
Move API credentials to a secure backend service.
Improve accessibility and mobile responsiveness.
🤝 Contributing

Contributions, suggestions, and bug reports are welcome!

Fork the repository.
Create a feature branch.
Make your changes and test the application.
Commit and push your changes.
Open a pull request with a description of your improvements.

👨‍💻 Author

Aman Chand

GitHub: @AmanChand-leo
Repository: Weather-App

⭐ If you find this project useful, consider giving the repository a star!
