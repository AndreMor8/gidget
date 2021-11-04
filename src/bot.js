import dotenv from 'dotenv';
dotenv.config();
//Database
import database from "./database/database.js";

//Registry for commands and events
import { registerCommands, registerEvents, registerApplicationCommands } from './utils/registry.js';

//Other packages
import b from "./utils/badwords.js";

//Discord import
import Discord from 'discord.js';

import DisTube from 'distube';
import { SoundCloudPlugin } from '@distube/soundcloud';
import { SpotifyPlugin } from '@distube/spotify';
import { inspect } from 'util';

const sweepInterval = 1800;

//Bot client
const bot = new Discord.Client({
  ws: {
    properties: {
      $browser: "Discord Android"
    }
  },
  makeCache: Discord.Options.cacheWithLimits({
    ApplicationCommandManager: 0,
    BaseGuildEmojiManager: 0,
    ChannelManager: Infinity,
    GuildChannelManager: Infinity,
    GuildBanManager: 0,
    GuildInviteManager: 0,
    GuildManager: Infinity,
    GuildMemberManager: {
      maxSize: Infinity,
      sweepInterval,
      sweepFilter: () => (member) => {
        if (member.id === bot.user.id) return false;
        if (member.voice.channelId && bot.distube.voices.collection.some(e => e.channel.id === member.voice.channelId)) return false;
        return true;
      },
    },
    GuildStickerManager: 0,
    MessageManager: 20,
    PermissionOverwriteManager: Infinity,
    PresenceManager: 0,
    ReactionManager: 0,
    ReactionUserManager: 0,
    RoleManager: Infinity,
    StageInstanceManager: Infinity,
    ThreadManager: Infinity,
    ThreadMemberManager: 0,
    UserManager: {
      maxSize: Infinity,
      sweepInterval,
      sweepFilter: () => (user) => {
        if (user.id === bot.user.id) return false;
        if (user.mine) return false;
        return true;
      },
    },
    VoiceStateManager: Infinity
  }),
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
  restGlobalRateLimit: 50,
  intents: 32511
});

bot.badwords = (new b()).setOptions({ whitelist: ["crap", "butt", "bum", "poop", "balls"] });
bot.botIntl = Intl.DateTimeFormat("en", { weekday: "long", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", timeZone: "America/New_York", hour12: true, timeZoneName: "short" });
bot.botVersion = "2.30";
bot.records = new Map();

//Cache system
bot.cachedMessageReactions = new Discord.Collection();
bot.rrcache = new Discord.Collection();
bot.doneBanners = new Discord.Collection();
bot.distube = new DisTube.default(bot, {
  emitNewSongOnly: true,
  leaveOnFinish: true,
  savePreviousSongs: true,
  youtubeCookie: process.env.COOKIETEXT,
  youtubeIdentityToken: process.env.YT_IDENTITY,
  youtubeDL: true,
  plugins: [new SoundCloudPlugin(), new SpotifyPlugin({ api: { clientId: process.env.SPOTIFY_ID, clientSecret: process.env.SPOTIFY_SECRET } })]
});
bot.memberVotes = new Discord.Collection();

//DisTube events
bot.distube
  .on("playSong", (queue, song) => queue.textChannel.send(`<:JukeboxRobot:610310184484732959> Now playing: **${song.name}**`))
  .on("empty", queue => queue.textChannel.send("Queue deleted"))
  .on("finishSong", (queue) => bot.memberVotes.delete(queue.voiceChannel.guild.id))
  .on("initQueue", (queue) => queue.setVolume(100))
  .on("error", (channel, e) => {
    channel.send(`Some error ocurred. Here's a debug: ${e}`);
    console.error(e);
  });

(async () => {
  //Database
  if (process.argv[2] !== "ci") await database();
  //Registers
  await registerCommands(bot, "../old_commands");
  await registerEvents(bot, "../events");
  await registerApplicationCommands(bot, "../new_commands");
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
  //This will be useful to finding unknown errors sometimes
  if (error.requestData?.json) console.error(inspect(error.requestData.json, { depth: 5 }));
});

process.on("uncaughtException", err => {
  bot.destroy();
  console.error("Uncaught exception:", err);
  process.exit(1);
});
