module.exports = function () {

    //process.env variables defined in Azure if deployed to a web app. For testing, place IDs and Keys inline

    global.searchName = process.env.AZURE_SEARCH_NAME ? process.env.AZURE_SEARCH_NAME : "smrtsearch";

    global.indexName = process.env.INDEX_NAME ? process.env.AZURE_SEARCH_NAME : "musicianindex";

    global.searchKey = process.env.INDEX_NAME ? process.env.AZURE_SEARCH_KEY : "C3AD014F1A44817BA19B95059CDF1E5D";
    global.queryString = 'https://' + searchName + '.search.windows.net/indexes/' + indexName + '/docs?api-key=' + searchKey + '&api-version=2016-09-01&';

}