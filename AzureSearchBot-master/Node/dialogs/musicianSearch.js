const builder = require('botbuilder');
const searchHelper = require('../searchHelpers.js');
const messageHelper = require('../messageHelper.js');

module.exports = {
    id: 'Search',
    title: 'Search',
    dialog: [
        (session) => {
            //Prompt for string input
            builder.Prompts.text(session, 'What are you searching for?');
        },
        (session, results) => {
            //Sets name equal to resulting input
            const keyword = results.response;

            searchHelper.searchQuery(keyword, (err, result) => {
                if (err) {
                    console.log(`Search query failed with ${err}`);
                    session.send('error is ');//, err.message());
                    session.send(`Sorry, I had an error when talking to the server.`);
                } else if (result && result.length > 0) {
                    const message = messageHelper.getMusiciansCarousel(session, result);
                    session.endConversation(message);
                } else {
                    const message = "I couldn't find this";
                    //session.send('Anything else you need me to help with ?');
                    session.send(message);
                }
               
            });
        }
    ]
}

