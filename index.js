// See https://github.com/dialogflow/dialogflow-fulfillment-nodejs
// for Dialogflow fulfillment library docs, samples, and to report issues
'use strict';
 
const functions = require('firebase-functions');
const {WebhookClient} = require('dialogflow-fulfillment');
const {Card, Suggestion} = require('dialogflow-fulfillment');
 
process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements
 
exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });
  console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
 
  function welcome(agent) {
    agent.add(`Welcome to my agent!`);
  }
 
  function fallback(agent) {
    agent.add(`I didn't understand`);
    agent.add(`I'm sorry, can you try again?`);
  }
  
 const axios = require('axios'); // Ensure axios is installed and required

function CurrentTemperatureIntent(agent) {
    const city = agent.parameters['geo-city']; // This could be dynamic based on user input
    const apiKey = 'd86b3d09894a65ffe6a92c10f4afc74c';
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
  

    return axios.get(url)
        .then(response => {
            if (response.data && response.data.main && response.data.main.temp) {
                // Extracting temperature from the main object
                const temperature = response.data.main.temp;
                agent.add(`The current temperature in ${city} is ${temperature} degrees Celsius.`);
            } else {
                // Handling cases where the temperature data might be missing
                agent.add(`I couldn't fetch the temperature for ${city} right now. Please try again later.`);
            }
        })
        .catch(error => {
            // Log the error and provide a user-friendly message
            console.error('Error fetching temperature:', error);
            agent.add(`I'm sorry, I'm having trouble accessing the weather information right now. Please try again later.`);
        });
}
  
 function SunriseandSunsetTimeIntent(agent) {
    const city = agent.parameters['geo-city']; // Assuming 'geo-city' is set up in Dialogflow to capture city names
    const apiKey = 'd86b3d09894a65ffe6a92c10f4afc74c';
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;

    return axios.get(url)
        .then(response => {
            if (response.data && response.data.sys) {
                // Convert UNIX timestamp to readable time considering the timezone offset from the API
                const timezoneOffset = response.data.timezone; // in seconds
                const sunrise = new Date((response.data.sys.sunrise + timezoneOffset) * 1000).toLocaleTimeString("en-US");
                const sunset = new Date((response.data.sys.sunset + timezoneOffset) * 1000).toLocaleTimeString("en-US");
                agent.add(`In ${city}, the sun rises at ${sunrise} and sets at ${sunset}.`);
            } else {
                agent.add(`I couldn't fetch the sunrise and sunset times for ${city} right now. Please try again later.`);
            }
        })
        .catch(error => {
            console.error('Error fetching sunrise and sunset times:', error);
            agent.add(`I'm sorry, I'm having trouble accessing the sunrise and sunset information right now. Please try again later.`);
        });
}
  function ThreeDayWeatherForecastIntent(agent){
    const city = agent.parameters['geo-city']; // Assuming 'geo-city' is set up in Dialogflow to capture city names
    const apiKey = 'd86b3d09894a65ffe6a92c10f4afc74c';
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

    return axios.get(url)
        .then(response => {
            if (response.data && response.data.list && response.data.list.length > 0) {
                // Filtering out the first 3 periods (each period is 3 hours, so 24 entries for 3 days)
                let forecastMessages = response.data.list.slice(0, 24).map((entry, index) => {
                    if (index % 8 === 0) { // Taking only one entry per day to simplify
                        const date = new Date(entry.dt_txt).toLocaleDateString("en-US");
                        const temp = entry.main.temp;
                        const description = entry.weather[0].description;
                        return `On ${date}, the temperature will be around ${temp}°C with ${description}.`;
                    }
                }).filter(Boolean).join('\n'); // Remove undefined entries and join messages

                agent.add(`Here is the three-day weather forecast for ${city}:\n${forecastMessages}`);
            } else {
                agent.add(`I couldn't fetch the weather forecast for ${city} right now. Please try again later.`);
            }
        })
        .catch(error => {
            console.error('Error fetching three-day weather forecast:', error);
            agent.add(`I'm sorry, I'm having trouble accessing the weather forecast right now. Please try again later.`);
        });
  }


  // // Uncomment and edit to make your own intent handler
  // // uncomment `intentMap.set('your intent name here', yourFunctionHandler);`
  // // below to get this function to be run when a Dialogflow intent is matched
  // function yourFunctionHandler(agent) {
  //   agent.add(`This message is from Dialogflow's Cloud Functions for Firebase editor!`);
  //   agent.add(new Card({
  //       title: `Title: this is a card title`,
  //       imageUrl: 'https://developers.google.com/actions/images/badges/XPM_BADGING_GoogleAssistant_VER.png',
  //       text: `This is the body text of a card.  You can even use line\n  breaks and emoji! 💁`,
  //       buttonText: 'This is a button',
  //       buttonUrl: 'https://assistant.google.com/'
  //     })
  //   );
  //   agent.add(new Suggestion(`Quick Reply`));
  //   agent.add(new Suggestion(`Suggestion`));
  //   agent.setContext({ name: 'weather', lifespan: 2, parameters: { city: 'Rome' }});
  // }

  // // Uncomment and edit to make your own Google Assistant intent handler
  // // uncomment `intentMap.set('your intent name here', googleAssistantHandler);`
  // // below to get this function to be run when a Dialogflow intent is matched
  // function googleAssistantHandler(agent) {
  //   let conv = agent.conv(); // Get Actions on Google library conv instance
  //   conv.ask('Hello from the Actions on Google client library!') // Use Actions on Google library
  //   agent.add(conv); // Add Actions on Google library responses to your agent's response
  // }
  // // See https://github.com/dialogflow/fulfillment-actions-library-nodejs
  // // for a complete Dialogflow fulfillment library Actions on Google client library v2 integration sample

  // Run the proper function handler based on the matched Dialogflow intent name
  let intentMap = new Map();
  intentMap.set('Default Welcome Intent', welcome);
  intentMap.set('Default Fallback Intent', fallback);
  intentMap.set('CurrentTemperatureIntent', CurrentTemperatureIntent);
  intentMap.set('SunriseandSunsetTimeIntent', SunriseandSunsetTimeIntent);
  intentMap.set('ThreeDayWeatherForecastIntent', ThreeDayWeatherForecastIntent);
  // intentMap.set('your intent name here', yourFunctionHandler);
  // intentMap.set('your intent name here', googleAssistantHandler);
  agent.handleRequest(intentMap);
});
