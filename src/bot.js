import dotenv from 'dotenv';
dotenv.config();
//Database
import database from "./database/database.js";

//Registry for commands and events
import { registerCommands, registerEvents, registerWsEvents } from './utils/registry.js';

//Other packages
import DBL from 'dblapi.js';

//Discord import
import Discord from 'discord.js-light';

//Discord.js extended structures
import './structures.js';

//Bot client
const bot = new Discord.Client({
  partials: ["MESSAGE", "REACTION", "CHANNEL", "GUILD_MEMBER", "USER"],
  ws: {
    properties: {
      $browser: "Discord Android"
    },
    intents: 32511
  },
  allowedMentions: {
    parse: []
  },
  presence: {
    status: "dnd",
    activity: {
      name: "Ready event (Loading...)",
      type: "LISTENING"
    }
  },
  cacheGuilds: true,
  cacheChannels: false,
  cacheOverwrites: true,
  cacheRoles: true,
  cacheEmojis: false,
  cachePresences: false,
  messageEditHistoryMaxSize: 7,
  messageCacheMaxSize: 20
});

//top.gg
if (process.env.EXTERNAL === "yes") {
  bot.dbl = new DBL(process.env.DBLKEY, bot);
  bot.dbl.on("posted", () => {
    console.log("tog.gg: Server count posted!");
  });
  bot.dbl.on("error", e => {
    console.error("top.gg: Error:", e);
  });
}


bot.botIntl = Intl.DateTimeFormat("en", { weekday: "long", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", timeZone: "America/New_York", hour12: true, timeZoneName: "short" });
bot.botVersion = "1.00 Final";
(async () => {
  //Database
  if (process.argv[2] !== "ci") await database();
  //Commands
  await registerCommands(bot, "../commands");
  //Cache system
  bot.cachedMessageReactions = new Discord.Collection();
  bot.rrcache = new Discord.Collection();
  bot.doneBanners = new Discord.Collection();
  //Registers
  await registerEvents(bot, "../events");
  await registerWsEvents(bot, "../ws-events");
  //Login with Discord
  if (process.argv[2] !== "ci") {
    await bot.login();
    if (global.gc) setTimeout(() => global.gc(), 60000);
  } else process.exit();
})().catch(err => {
  console.log(err);
  process.exit(1);
});
process.on("unhandledRejection", error => {
  console.error("Unhandled promise rejection:", error);
});

process.on("uncaughtException", err => {
  bot.destroy();
  console.error("Uncaught exception:", err);
  process.exit(1);
});