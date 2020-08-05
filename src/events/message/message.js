const Discord = require("discord.js");
const b = require("../../utils/badwords");
const badwords = new b();
const MessageModel = require("../../database/models/customresponses");
const MessageModel2 = require("../../database/models/levelconfig");
const MessageModel3 = require("../../database/models/prefix");
const Levels = require("../../utils/discord-xp");
const timer = new Discord.Collection();
const littlething = new Map();
//Start message event
module.exports = async (bot, message = new Discord.Message(), nolevel = false) => {
  if (message.author.bot) return;
  //No embed repeats, also a little cooldown
  if(littlething.get(message.author.id) && littlething.get(message.author.id) === message.content) return;
  else {
    littlething.set(message.author.id, message.content)
    setTimeout(() => {
      littlething.delete(message.author.id);
    }, 2000);
  }
  //Guild-only things
  if (message.guild) {
    // Autoresponses
    let msgDocument;
    let c = bot.autoresponsecache.get(message.guild.id);
    if (c) {
      msgDocument = c;
    } else {
      msgDocument = await MessageModel.findOne({ guildId: message.guild.id });
      bot.autoresponsecache.set(message.guild.id, msgDocument);
    }
    if (msgDocument) {
      const { responses } = msgDocument;
      if (responses) {
        const arr = Object.entries(responses);
        for (let i in arr) {
          const regex = new RegExp(arr[i][0], "gmi");
          if (regex.test(message.content)) {
            await message.channel.send(arr[i][1]).catch(err => { });
          }
        }
      }
    }

    // Level system
    if (!nolevel) {
      let msgDocument2 = bot.level.get(message.guild.id);
      if (!msgDocument2) {
        msgDocument2 = await MessageModel2.findOne({ guildId: message.guild.id });
        bot.level.set(message.guild.id, msgDocument2);
      }
      if (msgDocument2 && msgDocument2.levelsystem) {
        if (!timer.get(message.author.id)) {
          timer.set(message.author.id, true);
          setTimeout(() => {
            timer.delete(message.author.id);
          }, 120000);
          const randomAmountOfXp = Math.floor(Math.random() * 9) + 1; // Min 1, Max 10
          const hasLeveledUp = await Levels.appendXp(
            message.author.id,
            message.guild.id,
            randomAmountOfXp
          );
          if (hasLeveledUp) {
            const user = await Levels.fetch(message.author.id, message.guild.id);
            let { roles } = msgDocument2;
            if (roles[user.level - 1]) {
              let toadd = roles[user.level - 1].filter(e => message.guild.roles.cache.has(e) && message.guild.roles.cache.get(e).editable && !message.guild.roles.cache.get(e).managed)
              message.member.roles.add(toadd);
            }
          }
          if (hasLeveledUp && msgDocument2.levelnotif) {
            const user = await Levels.fetch(message.author.id, message.guild.id);
            message.channel.send(
              `${message.author}, congratulations! You have leveled up to **${user.level}**. :tada:`
            ).catch(err => { });
          }
        }
      }
    }
    //Things for Wow Wow Discord
    if (message.guild.id === process.env.GUILD_ID && !message.channel.nsfw) {
      if (badwords.isProfane(message.content.toLowerCase())) {
        await message.delete()
        await message.reply("swearing is not allowed in this server!", { allowedMentions: { parse: ["users"] } });
      }
    }
  }

  // Command handler and custom prefix. Check that the channel is not a DM to check the prefix.

  let PREFIX;
  if (message.guild) {
    let prefixes = bot.guildprefix.get(message.guild.id);
    if (!prefixes) {
      let pr = await MessageModel3.findOne({ guildId: message.guild.id })
      if (!pr) {
        PREFIX = "g%";
        bot.guildprefix.set(message.guild.id, "g%");
      } else {
        PREFIX = pr.prefix;
        bot.guildprefix.set(message.guild.id, pr.prefix);
      }
    } else {
      PREFIX = prefixes;
    }
  } else {
    console.log(message.author.tag + ' "' + message.content + '"');
    PREFIX = "g%";
  }
  //Mention check.
  if (message.mentions.users.get(bot.user.id) && message.content.startsWith("<@")) message.channel.send("My prefix in this server is " + PREFIX);
  //Check if message starts with prefix before starting any command
  if (!message.content.startsWith(PREFIX)) return;
  //Command structure
  //Arguments with spaces
  let args = message.content.substring(PREFIX.length).split(/ +/g);
  //let args = message.content.slice(PREFIX.length).trim().split(/ +/g);
  if (!args[0]) return;
  const command = bot.commands.get(args[0].toLowerCase()) || bot.commands.find(a => a.aliases.includes(args[0].toLowerCase()))
  if (command) {
    if (message.guild && message.channel.permissionsFor(bot.user).has("SEND_MESSAGES")) {
      command.run(bot, message, args)
        .catch(err => {
          console.error(err);
          message.channel.send("Something happened! Here's a debug: " + err).catch(err => { });
        });
    } else if (!message.guild) {
      command.run(bot, message, args)
        .catch(err => {
          console.error(err);
          message.channel.send("Something happened! Here's a debug: " + err).catch(err => { });
        });
    }
  }
};
