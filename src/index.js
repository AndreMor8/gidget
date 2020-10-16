import dotenv from 'dotenv';
dotenv.config();
import commons from './utils/commons.js';
const { require } = commons(import.meta.url);
// index.js
// where your node app starts

// init project
global.botIntl = Intl.DateTimeFormat("en", { dateStyle: "full", timeStyle: "full", timeZone: "America/New_York", hour12: true, timeZoneName: "short" })
const Discord = require('discord.js');
global.botCommands = new Discord.Collection();
import tfjs from '@tensorflow/tfjs-node';
global.tfjs = tfjs;
import './structures.js';
const bot = new Discord.Client({ partials: ["MESSAGE", "REACTION", "CHANNEL", "GUILD_MEMBER", "USER"], ws: { properties: { $browser: "Discord Android" }, intents: Discord.Intents.ALL }, allowedMentions: { parse: [] } });
import { registerCommands, registerEvents } from './utils/registry.js';
import puppeteer from "puppeteer";
export const version = "0.98 Post-Beta";
import nsfwjs from 'nsfwjs';
import database from "./database/database.js";

(async () => {
  //Pre-login
  global.nsfwjs = await nsfwjs.load();
  //Database
  await database();
  //Commands
  await registerCommands("../commands");
  //Cache system
  bot.cachedMessageReactions = new Discord.Collection();
  bot.rrcache = new Discord.Collection();
  //Puppeteer
  if (process.env.PUPPETEER !== "NO") {
    bot.browser = await puppeteer.launch({
      headless: true, defaultViewport: {
        width: 1440,
        height: 900
      }, args: ["--disable-gpu", "--no-sandbox", "--disable-setuid-sandbox"]
    });
  }
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

process.on("uncaughtException", err => {
  console.error("Uncaught exception: ", err);
});