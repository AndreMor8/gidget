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
  bot.dbl.on("posted", () => console.log("tog.gg: Server count posted!"));
  bot.dbl.on("error", e => console.error("top.gg: Error:", e));
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
  await registerCommands(bot, "../commands");
  await registerEvents(bot, "../events");
  await registerSlashCommands(bot, "../slashcommands");
  //temporal solution
  bot.ws.addListener("INTERACTION_CREATE", async (raw) => {
    const interaction = new Discord.CommandInteraction(bot, raw);
    if (interaction.isCommand() && raw.data.target_id) {
      const command = bot.slashCommands.filter(e => !!e.deployOptions.type).get(interaction.commandName);
      if (!command) return interaction.reply({ content: "That command doesn't exist", ephemeral: true });
      if (!interaction.guild && command.guildonly) return interaction.reply("This command only works on servers");
      if (interaction.guild) {
        if (!bot.guilds.cache.has(interaction.guild.id) && command.requireBotInstance) return interaction.reply("Please invite the real bot");
        const userperms = interaction.member.permissions;
        const userchannelperms = interaction.channel.permissionsFor(interaction.member.id);
        const botperms = interaction.guild.me.permissions;
        const botchannelperms = interaction.channel.permissionsFor(bot.user.id);
        if (interaction.user.id !== "577000793094488085") {
          if (!userperms.has(command.permissions.user[0])) return interaction.reply({ content: "You do not have the necessary permissions to run this command.\nRequired permissions:\n`" + (!(new Discord.Permissions(command.permissions.user[0]).has(8n)) ? (new Discord.Permissions(command.permissions.user[0]).toArray().join(", ") || "None") : "ADMINISTRATOR") + "`", ephemeral: true });
          if (!userchannelperms.has(command.permissions.user[1])) return interaction.reply({ content: "You do not have the necessary permissions to run this command **in this channel**.\nRequired permissions:\n`" + (!(new Discord.Permissions(command.permissions.user[1]).has(8n)) ? (new Discord.Permissions(command.permissions.user[1]).toArray().join(", ") || "None") : "ADMINISTRATOR") + "`", ephemeral: true });
        }
        if (!botperms.has(command.permissions.bot[0])) return interaction.reply({ content: "Sorry, I don't have sufficient permissions to run that command.\nRequired permissions:\n`" + (!(new Discord.Permissions(command.permissions.bot[0]).has(8n)) ? (new Discord.Permissions(command.permissions.bot[0]).toArray().join(", ") || "None") : "ADMINISTRATOR") + "`", ephemeral: true });
        if (!botchannelperms.has(command.permissions.bot[1])) return interaction.reply({ content: "Sorry, I don't have sufficient permissions to run that command **in this channel**.\nRequired permissions:\n`" + (!(new Discord.Permissions(command.permissions.bot[1]).has(8n)) ? (new Discord.Permissions(command.permissions.bot[1]).toArray().join(", ") || "None") : "ADMINISTRATOR") + "`", ephemeral: true });
      }
      try {
        await command.run(bot, raw, interaction);
      } catch (err) {
        if (err.name === "StructureError") {
          if (interaction.replied) await interaction.editReply(err.message).catch(() => { });
          else await interaction.reply(err.message).catch(() => { });
          return;
        }
        console.error(err);
        if (interaction.replied) await interaction.editReply("Something happened! Here's a debug: " + err).catch(() => { });
        else await interaction.reply("Something happened! Here's a debug: " + err).catch(() => { });
      }
    }
  });
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
