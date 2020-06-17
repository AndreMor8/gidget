require("dotenv").config();
// index.js
// where your node app starts

// init project
const Discord = require("discord.js");
const bot = new Discord.Client({ partials: ['MESSAGE', 'REACTION', 'CHANNEL', 'GUILD_MEMBER', 'USER'], ws: { properties: { $browser: "Discord Android" }, intents: Discord.Intents.ALL }});
const { registerCommands, registerEvents } = require('./utils/registry');
const database = require("./database/database");
let version = "0.50 Beta";

process.on("unhandledRejection", error => {
  console.error("Unhandled promise rejection:", error);
});

(async () => {
  await database.then(() => console.log("Connected to the database."));
  bot.musicVariables1 = new Discord.Collection();
  bot.queue = new Discord.Collection();
  bot.commands = new Discord.Collection();
  bot.cachedMessageReactions = new Discord.Collection();
  bot.autoresponsecache = new Discord.Collection();
  bot.level = new Discord.Collection();
  bot.rrcache = new Discord.Collection();
  bot.guildprefix = new Discord.Collection();
  await registerEvents(bot, "../events");
  await registerCommands(bot, "../commands");
  await bot.login(process.env.DISCORD_TOKEN);
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
