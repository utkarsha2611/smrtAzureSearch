var restify = require('restify');
var builder = require('botbuilder');
var rp = require('request-promise');


//=========================================================
// Bot Setup
//=========================================================

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});

// Create chat bot
// You will need to replace process env... with your own app id and password
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});

module.exports = {
    id: 'musicianExplorer',
    title: 'Musician Explorer',
    dialog: [
        (session) => {
            var bot = new builder.UniversalBot(connector);
            server.post('/api/messages', connector.listen());


            var intents = new builder.IntentDialog();

            //=========================================================
            // Bots Dialogs
            //=========================================================
            // Regexes are checked before sending to LUIS (if you used LUIS) so that you don't unnecessarily waste calls
            // Detects keywords in what the user says
            intents.matches(keywords.hi, '/sayHi');

            intents.onDefault(builder.DialogAction.send("Hmm I'm not too sure what you're trying to say."));

            bot.dialog('/', intents);

            bot.dialog('/showvideo', [
                function (session) {
                    session.endDialog('https://www.youtube.com/watch?v=zZb7dchCI2A');
                }
            ]);


        }]
}