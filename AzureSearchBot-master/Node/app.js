// load environmental variables

require('dotenv').config();

const request = require('request');
const restify = require('restify');
const builder = require('botbuilder');
const dialogs = {};
dialogs.musicianExplorer = require('./dialogs/musicianExplorer.js');
dialogs.musicianSearch = require('./dialogs/musicianSearch.js');

//If testing via the emulator, no need for appId and appPassword. If publishing, enter appId and appPassword here 

const connector = new builder.ChatConnector({

    appId: process.env.MICROSOFT_APP_ID,

    appPassword: process.env.MICROSOFT_APP_PASSWORD,

    gzipData: true

});
/*
// create the bot
const bot = new builder.UniversalBot(connector, (session) => {
    const message = new builder.Message(session);
    message.text = 'Explore SMRT Data repository';
    message.attachments([
        new builder.ThumbnailCard(session)
            .buttons([
              /*  builder.CardAction.imBack(
                    session, dialogs.musicianExplorer.title, dialogs.musicianExplorer.title
                ),*/
              /*  builder.CardAction.imBack(
                    session, dialogs.musicianSearch.title, dialogs.musicianSearch.title
           /*     )
            ])
            .title('Explore SMRT Data repository')
    ]);
    session.send(message);
}

);*/

//LUIS Setup
var recognizer = new builder.LuisRecognizer('https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/28abc727-a00e-4e11-9b5e-931c8f54db40?subscription-key=51d9a30fd9054be5809a257ad2c95d3e&verbose=true&timezoneOffset=0&q=');
var intentDialog = new builder.IntentDialog({ recognizers: [recognizer] });
var bot = new builder.UniversalBot(connector, { persistConversationData: true });
                

                // Bot Dialogs
                bot.dialog('/', intentDialog);

                //=========================================================
                //  LUIS Intents
                //=========================================================

                intentDialog.matches(/\b(hello|hi|hey|how are you)\b/i, '/sayHi');
                intentDialog.matches('dict', '/firstLoad');
                intentDialog.matches('showvideo', '/showvideo');
                intentDialog.matches('None', '/none');
                //   .matches('showvideo', '/showvideo');
                bot.dialog('/sayHi', function (session) { session.send('Hi there! I\'m SMaRT bot and I can help you with SMRT dictionary data and Training videos'); session.endDialog(); })

bot.dialog('/firstLoad',
    function (session) {
       // session.send('Hi there! I\'m SMaRT bot and I can help you with SMRT dictionary data, Training videos, etc');
                        const message = new builder.Message(session);
                        message.text = 'Explore SMRT Data repository';
                        message.attachments([
                            new builder.ThumbnailCard(session)
                                .buttons([
               /* builder.CardAction.imBack(
                    session, dialogs.musicianExplorer.title, dialogs.musicianExplorer.title
                ),*/
                builder.CardAction.imBack(
                    session, dialogs.musicianSearch.title, dialogs.musicianSearch.title
               )
            ])
            .title('Explore SMRT Data repository')
    ]);
        session.endDialog(message);
        
     });

bot.dialog('/showvideo', function (session, args) {
    session.endDialog('Yes sure! :) This is an interesting one I found - https://www.youtube.com/watch?v=zZb7dchCI2A');
});

bot.dialog('/none', function (session) { session.endDialog('Thanks for using me! Hope to see you soon!');})

// register the two dialogs
// musicianExplorer will provide a facet or category based search
bot.dialog(dialogs.musicianExplorer.id, dialogs.musicianExplorer.dialog)
    .triggerAction({ matches: new RegExp(dialogs.musicianExplorer.title, 'i') });

// musicianSearch will provide a classic search
bot.dialog(dialogs.musicianSearch.id, dialogs.musicianSearch.dialog)
    .triggerAction({ matches: new RegExp(dialogs.musicianSearch.title, 'i') });

// reset stuck dialogs in case of versioning
bot.use(builder.Middleware.dialogVersion({ version: 0.2, resetCommand: /^reset/i }));

// Setup Restify Server

const server = restify.createServer();

server.post('/api/messages', connector.listen());

server.listen(3978, () => {
    console.log('%s listening to %s', server.name, server.url);
});