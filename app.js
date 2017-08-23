// load environmental variables

// require('dotenv').config();

const request = require('request');
const restify = require('restify');
const builder = require('botbuilder');
const dialogs = {};
const botauth = require("botauth");
const path = require("path");
const envx = require("envx");

const OIDCStrategy = require('passport-azure-ad').OIDCStrategy;
const expressSession = require('express-session');
const https = require('https');

var api = require('./apiHandler.js');

//dialogs.musicianExplorer = require('./dialogs/musicianExplorer.js');
dialogs.musicianSearch = require('./dialogs/Search.js');

// Environment variable checks

const WEBSITE_HOSTNAME = envx("WEBSITE_HOSTNAME");
const PORT = envx("PORT", 3998);
const BOTAUTH_SECRET = envx("BOTAUTH_SECRET");

//bot application identity
//const MICROSOFT_APP_ID = envx("MICROSOFT_APP_ID");
//const MICROSOFT_APP_PASSWORD = envx("MICROSOFT_APP_PASSWORD");

//oauth details for dropbox
const AZUREAD_APP_ID = envx("AZUREAD_APP_ID");
const AZUREAD_APP_PASSWORD = envx("AZUREAD_APP_PASSWORD");
const AZUREAD_APP_REALM = envx("AZUREAD_APP_REALM");

//If testing via the emulator, no need for appId and appPassword. If publishing, enter appId and appPassword here 

const connector = new builder.ChatConnector({

    appId: process.env.MICROSOFT_APP_ID,

    appPassword: process.env.MICROSOFT_APP_PASSWORD,

    gzipData: true

});

//LUIS Setup
var recognizer = new builder.LuisRecognizer('https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/28abc727-a00e-4e11-9b5e-931c8f54db40?subscription-key=51d9a30fd9054be5809a257ad2c95d3e&verbose=true&timezoneOffset=0&q=');
var intentDialog = new builder.IntentDialog({ recognizers: [recognizer] });
var bot = new builder.UniversalBot(connector, { persistConversationData: true });


// Setup Restify Server
const server = restify.createServer();

server.post('/api/messages', connector.listen());

server.listen(3978, () => {
    console.log('%s listening to %s', server.name, server.url);
});

server.get('/code', restify.serveStatic({
    'directory': path.join(__dirname, 'public'),
    'file': 'code.html'
    }));

//=========================================================
// Auth Setup
//=========================================================

server.use(restify.queryParser());
server.use(restify.bodyParser());
server.use(expressSession({ secret: BOTAUTH_SECRET, resave: true, saveUninitialized: false }));
//server.use(passport.initialize());

var ba = new botauth.BotAuthenticator(server, bot, { session: true, baseUrl: `https://${WEBSITE_HOSTNAME}`, secret : BOTAUTH_SECRET, successRedirect: '/code' });

ba.provider("aadv2", (options) => {
    // Use the v2 endpoint (applications configured by apps.dev.microsoft.com)
    // For passport-azure-ad v2.0.0, had to set realm = 'common' to ensure authbot works on azure app service
    let oidStrategyv2 = {
      redirectUrl: options.callbackURL, //  redirect: /botauth/aadv2/callback
      realm: AZUREAD_APP_REALM,
      clientID: AZUREAD_APP_ID,
      clientSecret: AZUREAD_APP_PASSWORD,
      identityMetadata: 'https://login.microsoftonline.com/' + AZUREAD_APP_REALM + '/v2.0/.well-known/openid-configuration',
      skipUserProfile: false,
      validateIssuer: false,
      //allowHttpForRedirectUrl: true,
      responseType: 'code',
      responseMode: 'query',
      scope: ['profile', 'User.Read'],
      passReqToCallback: true
    };

    let strategy = oidStrategyv2;

    return new OIDCStrategy(strategy,
        (req, iss, sub, profile, accessToken, refreshToken, done) => {
          if (!profile.displayName) {
            return done(new Error("No oid found"), null);
          }
          profile.accessToken = accessToken;
          profile.refreshToken = refreshToken;
          done(null, profile);
    });
});



// Bot Dialogs
bot.dialog('/', intentDialog);

bot.dialog("/logout", (session) => {
    ba.logout(session, "aadv2");
    session.endDialog("logged_out");
});

bot.dialog("/signin", [].concat(
    ba.authenticate("aadv2"),
    (session, args, skip) => {
        let user = ba.profile(session, "aadv2");
        session.endDialog(user.displayName);
        session.userData.accessToken = user.accessToken;
        session.userData.refreshToken = user.refreshToken;
        session.beginDialog('menu');
    }
));

//=========================================================
//  LUIS Intents
//=========================================================

intentDialog.matches(/\b(hello|hi|hey|how are you)\b/i, '/sayHi');
intentDialog.matches(/\b(groups)\b/, '/getGroups');
intentDialog.matches(/logout/, "/logout");
intentDialog.matches(/signin/, "/signin");
intentDialog.matches('dict', '/firstLoad');
intentDialog.matches('showvideo', '/showvideo');
intentDialog.matches('None', '/none');
//   .matches('showvideo', '/showvideo');
bot.dialog('/sayHi', function (session) { session.send('Hi there! I\'m SMaRT bot and I can help you with SMRT dictionary data and Training videos. Try saying \'Search dictionary\ or \'Show video\''); session.endDialog(); })

bot.dialog('/getGroups', [
    (session, args) => {
        api.getUserGroups(session.userData.accessToken, (err, body, res) => {
            if (err) {
                session.endDialog(err);
            }
            session.send(body);
            session.endDialog(res);
        })
    }
]);

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

bot.dialog('/none', function (session) { session.endDialog('Thanks for using me! Hope to see you soon!'); })

// register the two dialogs
// musicianExplorer will provide a facet or category based search
/*bot.dialog(dialogs.musicianExplorer.id, dialogs.musicianExplorer.dialog)
    .triggerAction({ matches: new RegExp(dialogs.musicianExplorer.title, 'i') });*/

// musicianSearch will provide a classic search
bot.dialog(dialogs.musicianSearch.id, dialogs.musicianSearch.dialog)
    .triggerAction({ matches: new RegExp(dialogs.musicianSearch.title, 'i') });

// reset stuck dialogs in case of versioning
bot.use(builder.Middleware.dialogVersion({ version: 0.2, resetCommand: /^reset/i }));

