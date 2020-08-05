const fs = require('fs');
const url = require('url');

const data = require('./assets/sites.json');

// methods to be exported
function checkCleanUrl(urlFromReq) {
    let parsedUrl = url.parse(urlFromReq);
    let host = parsedUrl.host || parsedUrl.pathname.trim().split("/")[0];
    if(!host.startsWith('www.')) {
        host = `www.${host}`;
    }
    if(host in data) {
        return true;    
    }
    return false;
}


module.exports = checkCleanUrl;
