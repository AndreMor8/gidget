require("dotenv").config();
// index.js
// where your node app starts

// init project
const Discord = require("discord.js-light");
require("./structures");
const bot = new Discord.Client({ cacheGuilds: false, cacheChannels: false, cacheOverwrites: false, cacheRoles: false, cacheEmojis: false, cachePresences: false, ws: { properties: { $browser: "Discord Android" }, intents: Discord.Intents.ALL }, allowedMentions: { parse: [] }});
const reg = require('./utils/registry');
const puppeteer = require("puppeteer");
const database = require("./database/database");
let version = "0.98 Post-Beta";

process.on("unhandledRejection", error => {
  console.error("Unhandled promise rejection:", error);
});

(async () => {
  //Pre-login
  //Database
  await database.then(() => console.log("Connected to the database."));
  //Command collection
  bot.commands = new Discord.Collection();
  //Cache system
  bot.cachedMessageReactions = new Discord.Collection();
  bot.rrcache = new Discord.Collection();
  //Timezone thing
  bot.intl = Intl.DateTimeFormat("en", { dateStyle: "full", timeStyle: "full", timeZone: "America/New_York", hour12: true, timeZoneName: "short" })
  //Puppeteer
  bot.browser = await puppeteer.launch({ headless: true, defaultViewport: {
    width: 1440,
    height: 900
  }, args: ["--disable-gpu", "--no-sandbox", "--disable-setuid-sandbox"] });
  //Registers
  reg.registerEvents(bot, "../events");
  reg.registerCommands(bot, "../commands");
  //Login and post-login
  await bot.login();
  bot.user.setPresence({
    activity: { name: "Ready event (Loading...)", type: "LISTENING" },
    status: "dnd"
  });
})().catch(err => {
  console.log(err);
  setTimeout(() => process.exit(1), 1000);
});

module.exports = {
  bot, version
}
