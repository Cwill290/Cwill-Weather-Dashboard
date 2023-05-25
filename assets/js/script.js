document.addEventListener("DOMContentLoaded", () => {
    // DOM elements
    const cityInput = document.getElementById("enter-city");
    const searchButton = document.getElementById("search-button");
    const clearButton = document.getElementById("clear-history");
    const cityNameEl = document.getElementById("city-name");
    const currentPicEl = document.getElementById("current-pic");
    const currentTempEl = document.getElementById("temperature");
    const currentHumidityEl = document.getElementById("humidity");
    const currentWindEl = document.getElementById("wind-speed");
    const currentUVEl = document.getElementById("UV-index");
    const historyForm = document.getElementById("history");
    const forecastRow = document.getElementById("forecast-row");
    const todayWeatherEl = document.getElementById("today-weather");
    const fiveDayHeaderEl = document.getElementById("fiveday-header");
  
    // Retrieve search history from local storage
    let searchHistory = JSON.parse(localStorage.getItem("search")) || [];
  
    const APIKey = "91d2e892d7a42fe7fc6378322bd8aa32";
  
    // Function to convert temperature from Kelvin to Fahrenheit
    function k2f(K) {
      return Math.floor((K - 273.15) * 1.8 + 32);
    }
  
    // Function to show search history
    function renderSearchHistory() {
      historyForm.innerHTML = "";
      for (let i = 0; i < searchHistory.length; i++) {
        const historyItem = document.createElement("input");
        historyItem.setAttribute("type", "text");
        historyItem.setAttribute("readonly", true);
        historyItem.setAttribute("class", "form-control d-block bg-white");
        historyItem.setAttribute("value", searchHistory[i]);
        historyItem.addEventListener("click", function () {
          getWeather(historyItem.value);
        });
        historyForm.appendChild(historyItem);
      }
    }
  
    // Function to create a forecast cards
    function createForecastCard(forecastIndex, response) {
      const forecastDate = new Date(response.data.list[forecastIndex].dt * 1000);
      const forecastDay = forecastDate.getDate();
      const forecastMonth = forecastDate.getMonth() + 1;
      const forecastYear = forecastDate.getFullYear();
  
      const forecastCard = document.createElement("div");
      forecastCard.classList.add("card", "forecast-card");
  
      const cardBody = document.createElement("div");
      cardBody.classList.add("card-body");
  
      const forecastDateEl = document.createElement("h5");
      forecastDateEl.classList.add("card-title");
      forecastDateEl.textContent = `${forecastMonth}/${forecastDay}/${forecastYear}`;
  
      const forecastWeatherEl = document.createElement("img");
      forecastWeatherEl.setAttribute(
        "src",
        `https://openweathermap.org/img/wn/${response.data.list[forecastIndex].weather[0].icon}.png`
      );
      forecastWeatherEl.setAttribute(
        "alt",
        response.data.list[forecastIndex].weather[0].description
      );
  
      const forecastTempEl = document.createElement("p");
      forecastTempEl.classList.add("card-text");
      forecastTempEl.innerHTML = `Temp: ${k2f(
        response.data.list[forecastIndex].main.temp
      )} °F`;
  
      const forecastWindEl = document.createElement("p");
      forecastWindEl.classList.add("card-text");
      forecastWindEl.innerHTML = `Wind Speed: ${response.data.list[forecastIndex].wind.speed} MPH`;
  
      const forecastHumidityEl = document.createElement("p");
      forecastHumidityEl.classList.add("card-text");
      forecastHumidityEl.innerHTML = `Humidity: ${response.data.list[forecastIndex].main.humidity}%`;
  
      cardBody.appendChild(forecastDateEl);
      cardBody.appendChild(forecastWeatherEl);
      cardBody.appendChild(forecastTempEl);
      cardBody.appendChild(forecastWindEl);
      cardBody.appendChild(forecastHumidityEl);
  
      forecastCard.appendChild(cardBody);
  
      return forecastCard;
    }
  
    // Function to render the 5-day forecast
    function renderForecast(response) {
      forecastRow.innerHTML = "";
  
      for (let i = 0; i < 5; i++) {
        const forecastIndex = i * 8 + 4;
        const forecastCard = createForecastCard(forecastIndex, response);
        forecastRow.appendChild(forecastCard);
      }
    }
  
    // Function to fetch weather data for cities
    function getWeather(cityName) {
      const queryURL = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${APIKey}`;
  
      axios
        .get(queryURL)
        .then((response) => {
          todayWeatherEl.classList.remove("d-none");
  
          const currentDate = new Date(response.data.dt * 1000);
          const day = currentDate.getDate();
          const month = currentDate.getMonth() + 1;
          const year = currentDate.getFullYear();
          cityNameEl.innerHTML = `${response.data.name} (${month}/${day}/${year})`;
          const weatherPic = response.data.weather[0].icon;
          currentPicEl.setAttribute(
            "src",
            `https://openweathermap.org/img/wn/${weatherPic}.png`
          );
          currentPicEl.setAttribute("alt", response.data.weather[0].description);
          currentTempEl.innerHTML = `Temperature: ${k2f(
            response.data.main.temp
          )} °F`;
          currentHumidityEl.innerHTML = `Humidity: ${response.data.main.humidity}%`;
          currentWindEl.innerHTML = `Wind Speed: ${response.data.wind.speed} MPH`;
  
          const lat = response.data.coord.lat;
          const lon = response.data.coord.lon;
          const UVQueryURL = `https://api.openweathermap.org/data/2.5/uvi/forecast?lat=${lat}&lon=${lon}&appid=${APIKey}&cnt=1`;
  
          axios.get(UVQueryURL).then((response) => {
            const UVIndex = document.createElement("span");
  
            if (response.data[0].value < 4) {
              UVIndex.setAttribute("class", "badge badge-success");
            } else if (response.data[0].value < 8) {
              UVIndex.setAttribute("class", "badge badge-warning");
            } else {
              UVIndex.setAttribute("class", "badge badge-danger");
            }
  
            UVIndex.innerHTML = response.data[0].value;
            currentUVEl.innerHTML = "UV Index: ";
            currentUVEl.append(UVIndex);
          });
  
          const cityID = response.data.id;
          const forecastQueryURL = `https://api.openweathermap.org/data/2.5/forecast?id=${cityID}&appid=${APIKey}`;
  
          axios.get(forecastQueryURL).then((response) => {
            fiveDayHeaderEl.classList.remove("d-none");
            renderForecast(response);
          });
        })
        .catch((error) => {
          console.log(error);
        });
    }
  
    // Event listener for search button
    searchButton.addEventListener("click", () => {
      const searchTerm = cityInput.value.trim();
      if (searchTerm) {
        getWeather(searchTerm);
        searchHistory.push(searchTerm);
        localStorage.setItem("search", JSON.stringify(searchHistory));
        renderSearchHistory();
        cityInput.value = "";
      }
    });
  
    // Event listener for clear button
    clearButton.addEventListener("click", () => {
      localStorage.clear();
      searchHistory = [];
      renderSearchHistory();
    });
  
    // Render search history
    renderSearchHistory();
  
    // Fetch weather data for the last searched city on page load
    if (searchHistory.length > 0) {
      getWeather(searchHistory[searchHistory.length - 1]);
    }
  });
  