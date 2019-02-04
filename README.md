# weather-app-js
**Project in progress - let me know if you find bugs!**

Fetches and displays current weather data for a user-given city. Uses vanilla Javascript, Bulma, HERE API and OpenWeatherMap API. User needs to **recreate config.js file** with their own HERE API and OpenWeatherMap API keys before use.


### Installing

```
npm install
npm run css-build
```

### Create config.js
To use, first create config.js file containing the following:

```
const config = {
  OWMAPIKey: " your OpenWeatherMap API Key ",
  hereAPIId: " your HERE API Id ",
  hereAPICode: " your HERE API Code "
}
```

### Known issues (todo list!)
* Clicking "Get Weather" button does not fetch matching cities. Workaround: Press enter on input field 
* (intermittent) Clicking "Get Weather" button causes page refresh.
