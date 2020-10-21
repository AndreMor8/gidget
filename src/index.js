//Core
import dotenv from 'dotenv';
import commons from './utils/commons.js';

//Database
import database from "./database/database.js";

//Registry for commands and events
import { registerCommands, registerEvents } from './utils/registry.js';

//Other packages
import puppeteer from "puppeteer";
import DBL from 'dblapi.js';

//Discord.js extended structures
import './structures.js';

//Load .env contents
dotenv.config();

//Retro-compatibility with User extended structure
const { require } = commons(import.meta.url);
const Discord = require('discord.js');

//Bot client
const bot = new Discord.Client({ partials: ["MESSAGE", "REACTION", "CHANNEL", "GUILD_MEMBER", "USER"], ws: { properties: { $browser: "Discord Android" }, intents: 32511 }, allowedMentions: { parse: [] }, presence: { status: "dnd", activity: { name: "Ready event (Loading...)", type: "LISTENING" } } });

//top.gg
if(process.env.DBL === "yes") {
  bot.dbl = new DBL(process.env.DBLKEY, bot);
  bot.dbl.on("posted", () => {
    console.log("tog.gg: Server count posted!");
  });
  bot.dbl.on("error", e => {
    console.error("top.gg: Error:", err);
  });
}

//Global definitions
global.botIntl = Intl.DateTimeFormat("en", { timeZone: "America/New_York", hour12: true, timeZoneName: "short" });
global.botVersion = "0.99 RC";
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
  //Login with Discord
  await bot.login();
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