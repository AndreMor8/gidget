const url = require('url');
const data = require('./assets/sites.json');
const isporncallback = require('is-porn');
const { promisify } = require('util');
const isPorn = promisify(isporncallback);
// methods to be exported
function checkCleanUrl(urlFromReq) {
    let parsedUrl = url.parse(urlFromReq);
    let host = parsedUrl.host || parsedUrl.pathname.trim().split("/")[0];
    if (host in data) return true;
    let thing = host.split(".");
    let check1 = thing.slice(thing.length - 2).join(".");
    let check2 = "www." + check1;
    if (check2 in data) return true;
    if (!host.startsWith('www.')) host = `www.${host}`;
    if (host in data) return true;
    return false;
}

async function checkSingleCleanURL(urlFromReq) {
    let parsedUrl = url.parse(urlFromReq);
    let host = parsedUrl.host || parsedUrl.pathname.trim().split("/")[0];
    if (host in data) return true;
    let thing = host.split(".");
    let check1 = thing.slice(thing.length - 2).join(".");
    let check2 = "www." + check1;
    if (check2 in data) return true;
    if (!host.startsWith('www.')) host = `www.${host}`;
    if (host in data) return true;
    const cosas = await isPorn(check1);
    if (cosas) return true;
    return false;
}

module.exports = {
    checkCleanUrl,
    checkSingleCleanURL
};