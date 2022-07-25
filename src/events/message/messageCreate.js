import { getCustomResponses, getLevelConfig, getAutoPostChannels } from "../../extensions.js";
import Discord from "discord.js";
import Levels from "../../utils/discord-xp.js";
const timer = new Discord.Collection();
//Only 1 command at a time.
const internalCooldown = new Set();

export default async (bot, message, nolevel = false) => {
  if (message.author.bot) return;
  if (message.guild && !message.channel.permissionsFor(bot.user.id)?.has("SendMessages")) return;
  try {
    //All-time message code
    if (!message.guild) {
      //Always fetch user
      await message.author.fetch({ cache: true }).catch(() => { });
      //Always fetch author's DM.
      await message.author.createDM().catch(() => { });
    }
    const PREFIX = `${bot.user.toString()} `;
    if (message.content.startsWith(PREFIX)) {
      if (internalCooldown.has(message.author.id)) return;
      //Command message code
      //Command structure
      //Arguments with spaces
      const args = message.content.substring(PREFIX.length).trimEnd().split(/ +/g);
      if (!args[0]) return;
      const command = bot.commands.get(args[0].toLowerCase()) || bot.commands.find(a => a.aliases.includes(args[0].toLowerCase()));
      if (command) {
        //Always fetch channel
        await message.channel.fetch({ cache: true }).catch(() => { });
        //Always fetch member
        await message.member?.fetch({ cache: true }).catch(() => { });

        if (command.owner && message.author.id !== "577000793094488085") return message.channel.send("Only AndreMor can use this command");
        if (command.dev && message.author.id !== "577000793094488085") {
          if (!process.env.DEVS.split(",").includes(message.author.id)) return message.channel.send("Only Gidget developers can use this command");
        }
        if (!message.guild && command.guildonly) return message.channel.send("This command only works on servers");
        if (command.onlyguild && (message.guild ? message.guild.id !== process.env.GUILD_ID : true)) return message.channel.send("This command only works on Wow Wow Discord");
        if (message.guild) {
          const userperms = message.member.permissions;
          const userchannelperms = message.channel.permissionsFor(message.member.id);
          const botperms = message.guild.members.me.permissions;
          const botchannelperms = message.channel.permissionsFor(bot.user.id);
          if (message.author.id !== "577000793094488085") {
            if (!userperms.has(command.permissions.user[0])) return message.channel.send("You do not have the necessary permissions to run this command.\nRequired permissions:\n`" + (!(new Discord.PermissionsBitField(command.permissions.user[0]).has(8n)) ? (new Discord.PermissionsBitField(command.permissions.user[0]).toArray().join(", ") || "None") : "Administrator") + "`");
            if (!userchannelperms.has(command.permissions.user[1])) return message.channel.send("You do not have the necessary permissions to run this command **in this channel**.\nRequired permissions:\n`" + (!(new Discord.PermissionsBitField(command.permissions.user[1]).has(8n)) ? (new Discord.PermissionsBitField(command.permissions.user[1]).toArray().join(", ") || "None") : "Administrator") + "`");
          }
          if (!botperms.has(command.permissions.bot[0])) return message.channel.send("Sorry, I don't have sufficient permissions to run that command.\nRequired permissions:\n`" + (!(new Discord.PermissionsBitField(command.permissions.bot[0]).has(8n)) ? (new Discord.PermissionsBitField(command.permissions.bot[0]).toArray().join(", ") || "None") : "Administrator") + "`");
          if (!botchannelperms.has(command.permissions.bot[1])) return message.channel.send("Sorry, I don't have sufficient permissions to run that command **in this channel**.\nRequired permissions:\n`" + (!(new Discord.PermissionsBitField(command.permissions.bot[1]).has(8n)) ? (new Discord.PermissionsBitField(command.permissions.bot[1]).toArray().join(", ") || "None") : "Administrator") + "`");
        }
        try {
          internalCooldown.add(message.author.id);
          await command.run(bot, message, args);
        } catch (err) {
          if (err.name === "StructureError") return message.channel.send(err.message).catch(() => { });
          console.error(err);
          await message.channel.send("Something happened! Here's a debug: " + err).catch(() => { });
        } finally {
          internalCooldown.delete(message.author.id);
        }
      }
    } else {
      //Non-commands message code
      //For the moment, guild-only things
      if (message.guild) {
        // Autoresponses
        const msgDocument = await getCustomResponses(message.guild);
        if (msgDocument) {
          const { responses } = msgDocument;
          if (responses) {
            const arr = Object.entries(responses);
            for (const i in arr) {
              try {
                const regex = new RegExp(arr[i][0], "gmi");
                if (regex.test(message.content) && message.channel.permissionsFor(bot.user.id).has("SendMessages")) {
                  await message.channel.send(arr[i][1]).catch(() => { });
                }
              } finally { null; }
            }
          }
        }

        // Level system
        if (!nolevel) {
          const msgDocument2 = await getLevelConfig(message.guild);
          if (msgDocument2 && msgDocument2.levelsystem) {
            if (!msgDocument2.nolevel.includes(message.channel.id)) {
              if (!timer.get(message.author.id)) {
                timer.set(message.author.id, true);
                setTimeout(() => timer.delete(message.author.id), 120000);
                const randomAmountOfXp = Math.floor(Math.random() * 9) + 1; // Min 1, Max 10
                const hasLeveledUp = await Levels.appendXp(
                  message.author.id,
                  message.guild.id,
                  randomAmountOfXp
                );
                if (hasLeveledUp) {
                  //Always fetch member
                  await message.member.fetch({ cache: true }).catch(() => { });
                  const user = await Levels.fetch(message.author.id, message.guild.id);
                  const { roles } = msgDocument2;
                  if (roles[user.level - 1]) {
                    const toadd = roles[user.level - 1].filter(e => message.guild.roles.cache.has(e) && message.guild.roles.cache.get(e).editable && !message.guild.roles.cache.get(e).managed)
                    message.member.roles.add(toadd);
                  }
                  if (msgDocument2.levelnotif) await message.channel.send(`${message.author}, congratulations! You have leveled up to **${user.level}**. :tada:`).catch(() => { });
                }

              }
            }
          }
        }

        //Autocrossposting
        const acp = await getAutoPostChannels(message.guild);
        if (acp.includes(message.channel.id) && message.channel.type === 5) {
          message.crosspost().catch(() => { });
        }
      }
    }
  } catch (err) {
    console.log(err);
  }
};
