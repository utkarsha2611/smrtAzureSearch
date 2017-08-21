module.exports = function () {
    //process.env variables defined in Azure if deployed to a web app. For testing, place IDs and Keys inline
    global.searchName = process.env.AZURE_SEARCH_NAME ? process.env.AZURE_SEARCH_NAME : "smrtsearch";
    global.indexName = process.env.INDEX_NAME ? process.env.AZURE_SEARCH_NAME : "musicianindex";
    global.searchKey = process.env.INDEX_NAME ? process.env.AZURE_SEARCH_KEY : "F82FB57F9BC78739A4D266FFDDCCB2E1";
    
    global.queryString = 'https://' + searchName + '.search.windows.net/indexes/' + indexName + '/docs?api-version=2016-09-01&search=' +searchKey;

 //   global.queryString = 'https://smrtsearch.search.windows.net/indexes/musicianindex/docs?api-version=2016-09-01&search=';

    }
