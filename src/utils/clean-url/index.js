import data from './assets/sites.json';
import isporncallback from 'is-porn';
import { promisify } from 'util';
const isPorn = promisify(isporncallback);
// methods to be exported
export function checkCleanUrl(urlFromReq) {
    const parsedUrl = new URL(urlFromReq);
    let host = parsedUrl.host || parsedUrl.pathname.trim().split("/")[0];
    if (host in data) return true;
    const thing = host.split(".");
    const check1 = thing.slice(thing.length - 2).join(".");
    const check2 = "www." + check1;
    if (check2 in data) return true;
    if (!host.startsWith('www.')) host = `www.${host}`;
    if (host in data) return true;
    return false;
}

export async function checkSingleCleanURL(urlFromReq) {
    const parsedUrl = new URL(urlFromReq);
    let host = parsedUrl.host || parsedUrl.pathname.trim().split("/")[0];
    if (host in data) return true;
    const thing = host.split(".");
    const check1 = thing.slice(thing.length - 2).join(".");
    const check2 = "www." + check1;
    if (check2 in data) return true;
    if (!host.startsWith('www.')) host = `www.${host}`;
    if (host in data) return true;
    const cosas = await isPorn(check1);
    if (cosas) return true;
    return false;
}