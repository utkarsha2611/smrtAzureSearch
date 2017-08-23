const builder = require('botbuilder');

module.exports = {
    getMusiciansCarousel: (session, items) => {
        // results found
        var message = new builder.Message(session).attachmentLayout(builder.AttachmentLayout.carousel);
        items.forEach((csv) => {
            // custom card for musician
            // update with your specific fields for output
            message.addAttachment(
                new builder.HeroCard(session)
                    .title(csv.RowKey)
                    .subtitle("Acronym : " + csv.PartitionKey)// + " | " + "Search Score: " + musician['@search.score'])
                    .text("Category : "+csv.Category + " \n\n Type :      " +csv.Type  )
                    .images([builder.CardImage.create(session, 'https://raw.githubusercontent.com/utkarsha2611/smrtAzureSearch/master/AzureSearchBot-master/images/smrt.PNG')])
            );
        })
        return message;
    }
}