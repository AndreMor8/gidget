const Promise = require("bluebird");
const api = require("nodemw");
const wiki = new api({
    protocol: 'https',
    server: 'wubbzy.fandom.com',
    path: '/',
    username: process.env.WIKI_NAME,
    password: process.env.WIKI_PASS,
    debug: false
});

Promise.promisifyAll(wiki);

module.exports = {
  api, wiki
};