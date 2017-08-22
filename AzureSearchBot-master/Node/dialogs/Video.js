const builder = require('botbuilder');
const searchHelper = require('../searchHelpers.js');
const messageHelper = require('../messageHelper.js');


// connecting with LUIS
var luisRecognizer = new builder.LuisRecognizer(process.env.LUIS_MODEL_URL || "https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/12046620-4a2d-48e9-87f4-caf6d75c9b2e?subscription-key=7c029b229e924655a57eb8afe6dc990a&verbose=true&timezoneOffset=0&q=");
var intentDialog = new builder.IntentDialog({ recognizers: [luisRecognizer] });

module.exports = {
    id: 'Video',
    title: 'Video',
    dialog: [
        (session) => {
            //Prompt for string input
            builder.Prompts.text(session, 'What are you searching for?');
        },
        (session, results) => {
            //Sets name equal to resulting input
            //const keyword = results.response;
            intentDialog.matches(/\b(hi|hello|hey|howdy|what's up)\b/i, '/signin') //Check for greetings using regex
                .matches(/logout/, "/logout");
            
        }
    ]
}

