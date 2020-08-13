const fs = require('fs');
const url = require('url');

const data = require('./assets/sites.json');

// methods to be exported
function checkCleanUrl(urlFromReq) {
    let parsedUrl = url.parse(urlFromReq);
    let host = parsedUrl.host || parsedUrl.pathname.trim().split("/")[0];
    if(host in data) return true;
    let thing = host.split(".");
    let check = "www." + thing.slice(1).join(".");
    if(check in data) return true;
    if(!host.startsWith('www.')) host = `www.${host}`;
    if(host in data) return true;
    return false;
}


module.exports = checkCleanUrl;
