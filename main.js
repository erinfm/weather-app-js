/* eslint-disable no-use-before-define */
/* eslint-disable no-console */
/* eslint func-style: ["error", "expression"] */
/* eslint-env browser */

const hereAPICode = config.hereAPICode;
const hereAPIId = config.hereAPIId;
const OWMAPIKey = config.OWMAPIKey;

let currentBackground = '.has-background-default';
let currentDate = '';
let currentTemp = '';
let inputValue = '';
let selectedCity = '';
let selectedCityId = '';
let weatherIcon = '';

const locationIdArray = [];

const column1 = document.getElementById('column1');
const column2 = document.getElementById('column2');
const datalist = document.getElementById('datalist');
const input = document.getElementById('inputField');
const inputPage = document.getElementById('cityInputPage');
const returnBtn = document.getElementById('returnBtn');
const weatherBtn = document.getElementById('weatherBtn');
const weatherPage = document.getElementById('weatherDataPage');

input.addEventListener('input', () => onInput());

input.addEventListener('keydown', e => {
  // Check if key pressed is return key
  if (e.keyCode === 13) {
    inputValue = input.value.toUpperCase();
    // If no country yet specified, get city/country data from API first, else get coordinates of location
    if (inputValue.includes(',')) getCoordinates();
    else getCityData();
  }
});

weatherBtn.addEventListener('click', e => {
  e.preventDefault();
  inputValue = input.value.toUpperCase();
  // If no country yet specified, get city/country data from API first, else get coordinates of location
  if (inputValue.includes(',')) getCoordinates();
  else getCityData();
});

returnBtn.addEventListener('click', () => onReturnButtonPress());

const onInput = function onInputByUser() {
  const val = document.getElementById('inputField').value;
  const opts = document.getElementById('datalist').childNodes;
  for (let i = 0; i < opts.length; i += 1) {
    if (opts[i].value === val) {
      // An item was selected from the list!
      selectedCity = opts[i].value
        .toLowerCase()
        .split(' ')
        .map(s => s.charAt(0).toUpperCase() + s.substring(1))
        .join(' ');
      selectedCityId = opts[i].id;
      break;
    }
  }
};

const getCoordinates = function getCoordinatesFromAPI() {
  fetch(
    `http://geocoder.api.here.com/6.2/geocode.json?locationid=${selectedCityId}&jsonattributes=1&gen=9&app_id=${hereAPIId}&app_code=${hereAPICode}`
  )
    .then(response => response.json())
    .then(data => {
      const latitude =
        data.response.view['0'].result['0'].location.displayPosition.latitude;
      const longitude =
        data.response.view['0'].result['0'].location.displayPosition.longitude;
      fetchWeather(latitude, longitude);
    })
    .catch(e => console.log('Error found!', e));
};

const getCityData = function getCityDataFromAPI() {
  // Make GET request to HERE API for place data matching user input
  fetch(
    `http://autocomplete.geocoder.api.here.com/6.2/suggest.json?app_id=${hereAPIId}&app_code=${hereAPICode}&resultType=areas&language=en&maxresults=5&query=${inputValue}`
  )
    .then(response => response.json())
    .then(data => {
      // Extract placename info from JSON
      const responseData = data.suggestions;
      // Run function to show matching cities in datalist dropdown
      showCities(responseData);
    })
    .catch(e => console.log('Error found!', e));
};

// Show cities that match user input in dropdown
const showCities = function showCitiesInDropdown(responseData) {
  const duplicatePreventer = [];
  // Remove all datalist items from previous searches first
  while (datalist.firstChild) datalist.removeChild(datalist.firstChild);
  responseData.forEach(data => {
    // If data doesn't contain a city name, disregard it
    if (data.address.city) {
      // Clean up data and edit into 'city, country' format
      const cityName = data.address.city.toUpperCase();
      const countryName = data.address.country.toUpperCase();
      // Add matching, non-duplicate values to datalist
      if (
        cityName.indexOf(inputValue) !== -1 &&
        duplicatePreventer.indexOf(countryName) === -1
      ) {
        const fullPlacename = `${cityName}, ${countryName}`;
        // Create new <option> element
        const option = document.createElement('option');
        option.className = 'locationOption';
        option.id = data.locationId;
        option.value = fullPlacename;
        // Add the <option> element to the <datalist>
        datalist.appendChild(option);
        // Add country to array so same city isn't shown twice
        duplicatePreventer.push(countryName);
        // Add location ID to locationIdArray
        locationIdArray.push(data.locationId);
      }
    }
  });
};

const fetchWeather = function fetchWeatherFromOpenWeatherMapAPI(latitude, longitude) {
  fetch(
    `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${OWMAPIKey}`
  )
    .then(response => response.json())
    .then(data => {
      console.log(data);
      // hide initial inputs and display weather data
      inputPage.classList.toggle('is-hidden');
      weatherPage.classList.toggle('is-hidden');
      getWeather(data);
    })
    .catch(e => console.log('Error found!', e));
};

const getWeather = function getWeatherInfoAndDisplay(data) {
  getWeatherIcon(data);
  displayWeatherIcon();
  getCurrentDate();
  displayCurrentDate();
  displayTemp(data);
  displayWeatherDetails(data);
  displayCityName();
  toggleBackgroundImg();
};

const getWeatherIcon = function getCityWeatherIcon(data) {
  // Get weather type ID from API and show corresponding font awesome icon
  switch (true) {
    // Thunderstorms
    case data.weather['0'].id > 199 && data.weather['0'].id < 233:
      weatherIcon = 'images/Cloud-Lightning.svg';
      break;
    // Drizzle
    case data.weather['0'].id > 299 && data.weather['0'].id < 322:
      weatherIcon = 'images/Cloud-Drizzle.svg';
      break;
    // Light rain
    case data.weather['0'].id === 500 ||
      data.weather['0'].id === 520 ||
      data.weather['0'].id === 521:
      weatherIcon = 'images/Cloud-Rain-Alt.svg';
      break;
    // Moderate to heavy rain
    case (data.weather['0'].id > 500 && data.weather['0'].id < 512) ||
      (data.weather['0'].id > 521 && data.weather['0'].id < 532):
      weatherIcon = 'images/Cloud-Rain.svg';
      break;
    // Sleet
    case data.weather['0'].id > 610 && data.weather['0'].id < 617:
      weatherIcon = 'images/Cloud-Snow.svg';
      break;
    // Snow
    case (data.weather['0'].id > 599 && data.weather['0'].id < 603) ||
      (data.weather['0'].id > 619 && data.weather['0'].id < 623):
      weatherIcon = 'images/Cloud-Snow-Alt.svg';
      break;
    // Atmosphere
    case data.weather['0'].id > 699 && data.weather['0'].id < 782:
      weatherIcon = 'images/Cloud-Fog.svg';
      break;
    // Light clouds
    case data.weather['0'].id === 801 || data.weather['0'].id === 802:
      weatherIcon = 'images/Cloud-Sun.svg';
      break;
    // Heavy clouds
    case data.weather['0'].id === 803 || data.weather['0'].id === 804:
      weatherIcon = 'images/Cloud.svg';
      break;
    // Else, clear
    default:
      weatherIcon = 'images/Sun.svg';
      break;
  }
};

const displayWeatherIcon = function displayMatchingWeatherIcon() {
  const weatherIconContainer = document.createElement('figure');
  const weatherIconImage = document.createElement('img');
  column1.appendChild(weatherIconContainer);
  weatherIconContainer.classList.add('image', 'is-pulled-right');
  weatherIconImage.setAttribute('src', `${weatherIcon}`);
  weatherIconContainer.appendChild(weatherIconImage);
};

const getCurrentDate = function getCurrentDateFromUser() {
  const options = {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  };
  currentDate = `${new Date().toLocaleTimeString('en-GB', options)}`;
};

const displayCurrentDate = function displayCurrentDateFromUser() {
  const dateBox = document.createElement('p');
  const dateBoxText = document.createTextNode(`${currentDate}`);
  dateBox.appendChild(dateBoxText);
  dateBox.classList.add(
    'is-size-5',
    'is-size-6-mobile',
    'has-text-white',
    'has-text-weight-normal',
    'is-marginless'
  );
  column2.appendChild(dateBox);
};

const displayTemp = function displayCurrentTemperature(data) {
  currentTemp = data.main.temp;
  const tempTextBox = document.createElement('h1');
  const tempText = document.createTextNode(`${Math.round(data.main.temp)}°C`);

  tempTextBox.appendChild(tempText);
  if (tempText.length > 4) {
    tempTextBox.classList.add(
      'is-size-2',
      'has-text-white',
      'has-text-weight-medium',
      'is-marginless'
    );
  } else {
    tempTextBox.classList.add(
      'is-size-1',
      'is-size-2-mobile',
      'has-text-white',
      'has-text-weight-medium',
      'is-marginless'
    );
  }
  column2.appendChild(tempTextBox);
};

const displayWeatherDetails = function displayWeatherTypeDetails(data) {
  const weatherInfoBox = document.createElement('p');
  const weatherInfoText = document.createTextNode(`${data.weather['0'].description}`);
  weatherInfoBox.appendChild(weatherInfoText);
  weatherInfoBox.classList.add(
    'is-size-4',
    'is-size-5-mobile',
    'has-text-white',
    'has-text-weight-normal',
    'is-marginless'
  );
  column2.appendChild(weatherInfoBox);
};

const displayCityName = function displaySelectedCityName() {
  const cityNameBox = document.createElement('p');
  const cityNameBoxText = document.createTextNode(`${selectedCity}`);
  cityNameBox.appendChild(cityNameBoxText);
  cityNameBox.classList.add(
    'is-size-5',
    'is-size-6-mobile',
    'has-text-white',
    'has-text-weight-normal',
    'is-marginless'
  );
  column2.appendChild(cityNameBox);
};

const toggleBackgroundImg = function toggleBackgroundImage() {
  if (currentTemp < 30) {
    weatherPage.classList.remove('has-background-default');
    weatherPage.classList.add('has-background-day-cool');
    currentBackground = 'has-background-day-cool';
  }
  if (currentTemp > 30) {
    weatherPage.classList.remove('has-background-default');
    weatherPage.classList.add('has-background-day-warm');
    currentBackground = 'has-background-day-warm';
  }
  if (
    weatherIcon === 'images/Cloud-Fog.svg' ||
    weatherIcon === 'images/Cloud-Snow.svg' ||
    weatherIcon === 'images/Cloud-Snow-Alt.svg'
  ) {
    weatherPage.classList.remove('has-background-default');
    weatherPage.classList.add('has-background-snow-mist');
    currentBackground = 'has-background-snow-mist';
  }
  if (
    weatherIcon === 'images/Cloud-Rain.svg' ||
    weatherIcon === 'images/Cloud-Lightning.svg'
  ) {
    weatherPage.classList.remove('has-background-default');
    weatherPage.classList.add('has-background-dark');
    currentBackground = 'has-background-dark';
  }
};

const onReturnButtonPress = function onReturnButtonPressResetValues() {
  // Remove previously weather data elements generated during previous search
  while (column1.firstChild) {
    column1.removeChild(column1.firstChild);
  }
  while (column2.firstChild) {
    column2.removeChild(column2.firstChild);
  }
  input.value = '';
  weatherPage.classList.remove(`${currentBackground}`);
  weatherPage.classList.add('has-background-default');
  inputPage.classList.toggle('is-hidden');
  weatherPage.classList.toggle('is-hidden');
  input.focus();
  currentTemp = '';
};
