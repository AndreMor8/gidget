import Promise from "bluebird";
import eeee from "nodemw";
export const api = eeee;
export const wiki = new api({
    protocol: 'https',
    server: 'wubbzy.fandom.com',
    path: '/',
    username: process.env.WIKI_NAME,
    password: process.env.WIKI_PASS,
    debug: false
});

Promise.promisifyAll(wiki);
