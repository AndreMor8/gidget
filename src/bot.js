import dotenv from 'dotenv';
dotenv.config();
//Database
import database from "./database/database.js";

//Registry for commands and events
import { registerCommands, registerEvents, registerSlashCommands } from './utils/registry.js';

//Other packages
import DBL from 'dblapi.js';
import b from "./utils/badwords.js";

//Discord import
import Discord from 'discord.js-light';
//Discord.js extended structures
import './structures.js';

import DisTube from 'distube';
import { inspect } from 'util';

//Bot client
const bot = new Discord.Client({
  ws: {
    properties: {
      $browser: "Discord Android"
    }
  },
  allowedMentions: {
    parse: []
  },
  presence: {
    status: "dnd",
    activities: [{
      name: "Ready event (Loading...)",
      type: "LISTENING"
    }]
  },
  cacheGuilds: true,
  cacheChannels: true,
  cacheOverwrites: true,
  cacheRoles: true,
  cacheEmojis: false,
  cachePresences: false,
  messageEditHistoryMaxSize: 7,
  messageCacheMaxSize: 20,
  restGlobalRateLimit: 50,
  intents: 32511
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

bot.badwords = (new b()).setOptions({ whitelist: ["crap", "butt", "bum", "poop", "balls"] });
bot.botIntl = Intl.DateTimeFormat("en", { weekday: "long", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", timeZone: "America/New_York", hour12: true, timeZoneName: "short" });
bot.botVersion = "2.00";
//Cache system
bot.cachedMessageReactions = new Discord.Collection();
bot.rrcache = new Discord.Collection();
bot.doneBanners = new Discord.Collection();
bot.distube = new DisTube.default(bot, {
  emitNewSongOnly: true,
  leaveOnFinish: true,
  savePreviousSongs: true,
  youtubeCookie: process.env.COOKIETEXT,
  youtubeIdentityToken: process.env.YT_IDENTITY
});
bot.memberVotes = new Discord.Collection();

//DisTube events
bot.distube
  .on("playSong", (queue, song) => queue.textChannel.send(`<:JukeboxRobot:610310184484732959> Now playing: **${song.name}**`))
  .on("error", (channel, e) => {
    channel.send(`Some error ocurred. Here's a debug: ${e}`);
    console.error(e);
  }).on("empty", queue => queue.textChannel.send("Queue deleted"))
  .on("finishSong", (queue) => bot.memberVotes.delete(queue.voiceChannel.guild.id))
  .on("initQueue", (queue) => queue.setVolume(100));

(async () => {
  //Database
  if (process.argv[2] !== "ci") await database();
  //Registers
  await registerCommands(bot, "../commands");
  await registerEvents(bot, "../events");
  await registerSlashCommands(bot, "../slashcommands");
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
  //This will be useful to finding unknown errors;
  if (error.requestData?.json) console.error(inspect(error.requestData.json, { depth: 5 }));
});

process.on("uncaughtException", err => {
  bot.destroy();
  console.error("Uncaught exception:", err);
  process.exit(1);
});
