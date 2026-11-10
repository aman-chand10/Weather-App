const form = document.querySelector('#search-form');
const input = document.querySelector('#location-input');
const locateButton = document.querySelector('#locate-button');
const area = document.querySelector('#weather-area');
const welcome = document.querySelector('#welcome-card');
const errorBox = document.querySelector('#error-message');
const content = document.querySelector('#weather-content');
const weatherCodes = {
  0: ['Clear sky', '☀'], 1: ['Mainly clear', '🌤'], 2: ['Partly cloudy', '⛅'], 3: ['Overcast', '☁'],
  45: ['Foggy', '🌫'], 48: ['Rime fog', '🌫'], 51: ['Light drizzle', '🌦'], 53: ['Drizzle', '🌦'], 55: ['Heavy drizzle', '🌧'],
  56: ['Freezing drizzle', '🌧'], 57: ['Freezing drizzle', '🌧'], 61: ['Light rain', '🌦'], 63: ['Rain', '🌧'], 65: ['Heavy rain', '🌧'],
  66: ['Freezing rain', '🌧'], 67: ['Freezing rain', '🌧'], 71: ['Light snow', '🌨'], 73: ['Snow', '❄'], 75: ['Heavy snow', '❄'], 77: ['Snow grains', '❄'],
  80: ['Rain showers', '🌦'], 81: ['Rain showers', '🌧'], 82: ['Heavy showers', '🌧'], 85: ['Snow showers', '🌨'], 86: ['Snow showers', '🌨'],
  95: ['Thunderstorm', '⛈'], 96: ['Thunderstorm', '⛈'], 99: ['Thunderstorm', '⛈']
};

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const query = input.value.trim();
  if (query) await findCity(query);
});

locateButton.addEventListener('click', () => {
  if (!navigator.geolocation) return showError('Location sharing isn’t available in this browser. Search for a city instead.');
  setLoading(true);
  navigator.geolocation.getCurrentPosition(
    ({ coords }) => loadWeather(coords.latitude, coords.longitude, 'Your location'),
    (error) => { setLoading(false); showError(error.code === 1 ? 'Location access was declined. Search for a city to see its weather.' : 'We couldn’t get your location. Try searching for a city instead.'); },
    { timeout: 12000, maximumAge: 300000 }
  );
});

async function findCity(query) {
  setLoading(true);
  try {
    const url = new URL('https://geocoding-api.open-meteo.com/v1/search');
    url.search = new URLSearchParams({ name: query, count: '1', language: 'en', format: 'json' });
    const response = await fetch(url);
    if (!response.ok) throw new Error('The location service is unavailable right now. Please try again.');
    const data = await response.json();
    if (!data.results?.length) throw new Error(`We couldn’t find “${query}”. Check the spelling or try a nearby city.`);
    const place = data.results[0];
    const label = [place.name, place.admin1 && place.admin1 !== place.name ? place.admin1 : '', place.country].filter(Boolean).join(', ');
    await loadWeather(place.latitude, place.longitude, label);
  } catch (error) { setLoading(false); showError(error.message || 'Something went wrong while looking up that location.'); }
}

async function loadWeather(latitude, longitude, label) {
  setLoading(true);
  try {
    const url = new URL('https://api.open-meteo.com/v1/forecast');
    url.search = new URLSearchParams({ latitude, longitude, current: 'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m', daily: 'weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max', timezone: 'auto', forecast_days: '5' });
    const response = await fetch(url);
    if (!response.ok) throw new Error('The weather service couldn’t load right now. Please try again in a moment.');
    renderWeather(await response.json(), label);
  } catch (error) { showError(error.message || 'Couldn’t load weather data. Please try again.'); }
  finally { area.setAttribute('aria-busy', 'false'); }
}

function renderWeather(data, label) {
  const now = data.current;
  const condition = weatherCodes[now.weather_code] || ['Weather conditions', '☁'];
  document.querySelector('#place-name').textContent = label;
  document.querySelector('#date-line').textContent = new Intl.DateTimeFormat('en', { weekday: 'long', month: 'long', day: 'numeric', timeZone: data.timezone }).format(new Date());
  document.querySelector('#condition-icon').textContent = condition[1];
  document.querySelector('#temperature').textContent = Math.round(now.temperature_2m);
  document.querySelector('#condition').textContent = condition[0];
  document.querySelector('#feels-like').textContent = Math.round(now.apparent_temperature);
  document.querySelector('#wind').textContent = `${Math.round(now.wind_speed_10m)} km/h`;
  document.querySelector('#humidity').textContent = `${now.relative_humidity_2m}%`;
  document.querySelector('#uv').textContent = Number(data.daily.uv_index_max[0]).toFixed(1);
  document.querySelector('#sunrise').textContent = formatTime(data.daily.sunrise[0], data.timezone);
  const grid = document.querySelector('#forecast-grid');
  grid.replaceChildren(...data.daily.time.map((date, index) => {
    const dayCondition = weatherCodes[data.daily.weather_code[index]] || ['Cloudy', '☁'];
    const card = document.createElement('article');
    card.className = 'forecast-day';
    const day = index === 0 ? 'Today' : new Intl.DateTimeFormat('en', { weekday: 'short', timeZone: data.timezone }).format(new Date(`${date}T12:00:00`));
    card.innerHTML = `<div class="day-name">${day}</div><div class="day-icon" aria-hidden="true">${dayCondition[1]}</div><div class="day-desc">${dayCondition[0]}</div><div class="day-temps"><span>${Math.round(data.daily.temperature_2m_max[index])}°</span><span>${Math.round(data.daily.temperature_2m_min[index])}°</span></div>`;
    return card;
  }));
  errorBox.hidden = true;
  welcome.hidden = true;
  content.hidden = false;
}

function formatTime(value, timezone) { return new Intl.DateTimeFormat('en', { hour: 'numeric', minute: '2-digit', timeZone: timezone }).format(new Date(value)); }

function setLoading(active) {
  area.setAttribute('aria-busy', String(active));
  errorBox.hidden = true;
  if (active) {
    content.hidden = true;
    welcome.hidden = true;
    const loading = document.createElement('div');
    loading.className = 'loading';
    loading.id = 'loading-state';
    loading.textContent = 'Finding your forecast…';
    area.querySelector('#loading-state')?.remove();
    area.append(loading);
  } else area.querySelector('#loading-state')?.remove();
}

function showError(message) {
  area.querySelector('#loading-state')?.remove();
  content.hidden = true;
  welcome.hidden = true;
  errorBox.textContent = message;
  errorBox.hidden = false;
}