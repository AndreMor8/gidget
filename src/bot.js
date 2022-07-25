import 'dotenv/config.js';
//Database
import database from "./database/database.js";

//Registry for commands and events
import { registerCommands, registerEvents, registerApplicationCommands } from './utils/registry.js';

//Other packages
import b from "./utils/badwords.js";

//Discord import
import Discord from 'discord.js';

import { inspect } from 'util';

const sweepInterval = 1800;

//Bot client
const bot = new Discord.Client({
  ws: {
    properties: {
      browser: "Discord Android"
    }
  },
  makeCache: Discord.Options.cacheWithLimits({
    GuildScheduledEventManager: 0,
    ApplicationCommandManager: 0,
    BaseGuildEmojiManager: 0,
    GuildEmojiManager: 0,
    GuildBanManager: 0,
    GuildInviteManager: 0,
    GuildMemberManager: Infinity,
    GuildStickerManager: 0,
    MessageManager: 20,
    PresenceManager: 0,
    ReactionManager: Infinity,
    ReactionUserManager: Infinity,
    StageInstanceManager: Infinity,
    ThreadManager: Infinity,
    ThreadMemberManager: 0,
    UserManager: Infinity,
    VoiceStateManager: Infinity
  }),
  allowedMentions: {
    parse: []
  },
  presence: {
    status: "dnd",
    activities: [{
      name: "Ready event (Loading...)",
      type: 2
    }]
  },
  sweepers: {
    guildMembers: {
      interval: sweepInterval,
      filter: () => (member) => {
        if (member.id === bot.user.id) return false;
        if (member.voice.channelId) return false;
        if (member.pending) return false;
        return true;
      }
    },
    users: {
      interval: sweepInterval,
      filter: () => (user) => {
        if (user.id === bot.user.id) return false;
        if (user.mine) return false;
        return true;
      }
    }
  },
  intents: 14027,
  partials: [0, 1, 2, 3, 4, 5, 6]
});

bot.badwords = (new b()).setOptions({ whitelist: ["crap", "butt", "bum", "balls", "lesbian"] });
bot.botIntl = Intl.DateTimeFormat("en", { weekday: "long", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", timeZone: "America/New_York", hour12: true, timeZoneName: "short" });
bot.botVersion = "3.0.0";
bot.records = new Map();
bot.savedInvites = new Map();

//Cache system
bot.cachedMessageReactions = new Discord.Collection();
bot.rrcache = new Discord.Collection();
bot.doneBanners = new Discord.Collection();
bot.memberVotes = new Discord.Collection();

//Registers
await registerCommands(bot, "../old_commands");
await registerEvents(bot, "../events");
await registerApplicationCommands(bot, "../new_commands");
if (process.argv[2] !== "ci") {
  //Database
  await database();
  //Login with Discord
  await bot.login();
  //Garbage collector
  if (global.gc) setTimeout(() => global.gc(), 60000);
} else process.exit();


process.on("unhandledRejection", error => {
  console.error("Unhandled promise rejection:", error);
  //This will be useful to finding unknown errors sometimes
  if (error.requestBody?.json) console.error(inspect(error.requestBody.json, { depth: 5 }));
});

process.on("uncaughtException", err => {
  bot.destroy();
  console.error("Uncaught exception:", err);
  process.exit(1);
});
