import dotenv from 'dotenv';
dotenv.config();
import commons from './utils/commons.js';
const { require } = commons(import.meta.url);
// index.js
// where your node app starts

// init project
const Discord = require('discord.js');
import './structures.js';
export const bot = new Discord.Client({ partials: ["MESSAGE", "REACTION", "CHANNEL", "GUILD_MEMBER", "USER"], ws: { properties: { $browser: "Discord Android" }, intents: Discord.Intents.ALL }, allowedMentions: { parse: [] } });
import { registerCommands, registerEvents } from './utils/registry.js';
import puppeteer from "puppeteer";
export const version = "0.98 Post-Beta";
import nsfwjs from 'nsfwjs';
import '@tensorflow/tfjs-node';
const database = require("./database/database.cjs");

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
  if (process.env.PUPPETEER !== "NO") {
    bot.browser = await puppeteer.launch({
      headless: true, defaultViewport: {
        width: 1440,
        height: 900
      }, args: ["--disable-gpu", "--no-sandbox", "--disable-setuid-sandbox"]
    });
  }
  bot.nsfwjs = await nsfwjs.load();
  //Registers
  await registerEvents(bot, "../events");
  await registerCommands(bot, "../commands");
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

process.on("uncaughtException", err => {
  console.error("Uncaught exception: ", err);
});