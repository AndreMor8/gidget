import dotenv from 'dotenv';
dotenv.config();
import commons from './utils/commons.js';
const { require } = commons(import.meta.url);
// index.js
// where your node app starts

// init project
global.botIntl = Intl.DateTimeFormat("en", { timeZone: "America/New_York", hour12: true, timeZoneName: "short" })
const Discord = require('discord.js');
import './structures.js';
global.botCommands = new Discord.Collection();
const bot = new Discord.Client({ partials: ["MESSAGE", "REACTION", "CHANNEL", "GUILD_MEMBER", "USER"], ws: { properties: { $browser: "Discord Android" }, intents: 32511 }, allowedMentions: { parse: [] } });
import { registerCommands, registerEvents } from './utils/registry.js';
import puppeteer from "puppeteer";
import database from "./database/database.js";
import DBL from 'dblapi.js';
export const version = "0.98 Post-Beta";
if(process.env.DBL === "yes") {
  bot.dbl = new DBL(process.env.DBLKEY, bot);
  bot.dbl.on("posted", () => {
    console.log("tog.gg: Server count posted!");
  });
  bot.dbl.on("error", e => {
    console.error("top.gg: Error:", err);
  });
}
(async () => {
  //Puppeteer
  if (process.env.PUPPETEER !== "NO") {
    global.browser = await puppeteer.launch({
      headless: true, defaultViewport: {
        width: 1440,
        height: 900
      }, args: ["--disable-gpu", "--no-sandbox", "--disable-setuid-sandbox"]
    });
  }
  //Database
  await database();
  //Commands
  await registerCommands("../commands");
  //Cache system
  bot.cachedMessageReactions = new Discord.Collection();
  bot.rrcache = new Discord.Collection();
  //Registers
  await registerEvents(bot, "../events");
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
process.on("unhandledRejection", error => {
  console.error("Unhandled promise rejection:", error);
});

process.on("uncaughtException", async err => {
  global.browser ? await global.browser.close() : undefined;
  bot.destroy();
  console.error("Uncaught exception: ", err);
  process.exit(1);
});