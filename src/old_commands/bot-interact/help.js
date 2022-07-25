import def from "../../assets/definitions.json" assert {type: "json"};
import Discord from "discord.js";
import { splitMessage } from '../../extensions.js';
const buttons = [new Discord.ButtonBuilder().setLabel("Gidget's dashboard").setStyle("Link").setURL("https://gidget.andremor.dev"),
new Discord.ButtonBuilder().setLabel("Bot's documentation").setStyle("Link").setURL("https://docs.gidget.andremor.dev"),
new Discord.ButtonBuilder().setLabel("Source code").setStyle("Link").setURL("https://github.com/AndreMor8/gidget"),
new Discord.ButtonBuilder().setLabel("AndreMor's page").setStyle("Link").setURL("https://andremor.dev"),
new Discord.ButtonBuilder().setLabel("Discord.js documentation").setStyle("Link").setURL("https://discord.js.org/#/docs/")];
const action = Discord.ActionRowBuilder.prototype.addComponents.apply(new Discord.ActionRowBuilder(), buttons)
const botlists = `[MyBOT List](https://portalmybot.com/mybotlist/bot/694306281736896573) | [top.gg](https://top.gg/bot/694306281736896573) | [DiscordBotList](https://discordbotlist.com/bots/gidget) | [Discord Boats](https://discord.boats/bot/694306281736896573)`;

export default class extends Command {
  constructor(options) {
    super(options);
    this.aliases = ["h"];
    this.description = "Help command";
  }
  // eslint-disable-next-line require-await
  async run(bot, message, args) {
    const c = bot.commands;
    const arr = [];
    for (const o of Object.entries(def)) {
      arr.push({
        catname: o[0],
        cat: o[1].name,
        secret: o[1].secret,
        onlyguild: o[1].onlyguild,
        commands: c.filter(z => z.category === o[0]).map(e => e)
      })
    }
    if (args[1] && arr.find(d => d.catname === args[1])) {
      const g = arr.find(d => d.catname === args[1]);
      if (checkEmbed(message.channel)) {
        const embed = new Discord.EmbedBuilder()
          .setThumbnail("https://vignette.wikia.nocookie.net/wubbzy/images/7/7d/Gidget.png")
          .setColor("#FF8000")
          .setTitle(g.cat + " (" + g.commands.length + " commands)")
          .setDescription(splitMessage(g.commands.filter(s => {
            if (s.secret) return false
            if (s.onlyguild && (message.guild ? (message.guild.id !== process.env.GUILD_ID) : true)) return false
            return true
          }).map(s => "**" + s.name + "**: " + s.description).join("\n"))[0])
          .setTimestamp()
        message.channel.send({ embeds: [embed], components: [new Discord.ActionRowBuilder().addComponents(buttons[1])] });
      } else {
        const str = `__**${g.cat + " (" + g.commands.length + " commands)"}**__\n\n${splitMessage(g.commands.filter(s => {
          if (s.secret) return false;
          if (s.onlyguild && (message.guild ? (message.guild.id !== process.env.GUILD_ID) : true)) return false;
          return true;
        }, { maxLength: 1800 }).map(s => "**" + s.name + "**: " + s.description).join("\n"))[0]}`;
        message.channel.send({ content: str, components: [new Discord.ActionRowBuilder().addComponents(buttons[1])] });
      }
      return;
    } else if (args[1] && (bot.commands.get(args[1].toLowerCase()) || bot.commands.find(c => c.aliases.includes(args[1].toLowerCase())))) {
      const command = bot.commands.get(args[1].toLowerCase()) || bot.commands.find(c => c.aliases.includes(args[1].toLowerCase()))
      if (command.dev || command.owner) return message.channel.send("Exclusive command for the owner or developers");
      let alias = "Without alias";
      if (command.aliases.length !== 0) {
        alias = command.aliases.join(", ");
      }
      if (checkEmbed(message.channel)) {
        const embed = new Discord.EmbedBuilder()
          .setThumbnail("https://vignette.wikia.nocookie.net/wubbzy/images/7/7d/Gidget.png")
          .setTitle(`Gidget help - ${command.name}`)
          .addFields([
            { name: "Description", value: command.description ? command.description : "Without description" },
            { name: "Required permissions", value: `User: \`${!(new Discord.PermissionsBitField(command.permissions.user[0]).has(8n)) ? (new Discord.PermissionsBitField(command.permissions.user[0]).toArray().join(", ") || "None") : "Administrator"}\`\nBot: \`${!(new Discord.PermissionsBitField(command.permissions.bot[0]).has(8n)) ? (new Discord.PermissionsBitField(command.permissions.bot[0]).toArray().join(", ") || "None") : "Administrator"}\`` },
            { name: "Required permissions (channel)", value: `User: \`${!(new Discord.PermissionsBitField(command.permissions.user[1]).has(8n)) ? (new Discord.PermissionsBitField(command.permissions.user[1]).toArray().join(", ") || "None") : "Administrator"}\`\nBot: \`${!(new Discord.PermissionsBitField(command.permissions.bot[1]).has(8n)) ? (new Discord.PermissionsBitField(command.permissions.bot[1]).toArray().join(", ") || "None") : "Administrator"}\`` },
            { name: "Environment", value: (command.guildonly || command.onlyguild) ? "Server" : "Server and DMs" },
            { name: "Alias", value: alias }
          ])
          .setColor('#FFFFFF')
          .setFooter({ text: `Requested by: ${message.author.tag}`, iconURL: message.author.displayAvatarURL({}) })
          .setTimestamp();
        message.channel.send({ embeds: [embed] });
      } else {
        const perms = `User: \`${!(new Discord.PermissionsBitField(command.permissions.user[0]).has(8n)) ? (new Discord.PermissionsBitField(command.permissions.user[0]).toArray().join(", ") || "None") : "Administrator"}\`\nBot: \`${!(new Discord.PermissionsBitField(command.permissions.bot[0]).has(8n)) ? (new Discord.PermissionsBitField(command.permissions.bot[0]).toArray().join(", ") || "None") : "Administrator"}\``;
        const perms_channel = `User: \`${!(new Discord.PermissionsBitField(command.permissions.user[1]).has(8n)) ? (new Discord.PermissionsBitField(command.permissions.user[1]).toArray().join(", ") || "None") : "Administrator"}\`\nBot: \`${!(new Discord.PermissionsBitField(command.permissions.bot[1]).has(8n)) ? (new Discord.PermissionsBitField(command.permissions.bot[1]).toArray().join(", ") || "None") : "Administrator"}\``;
        const str = `__**Gidget help - ${command.name}**__\n\n__Description__: ${command.description ? command.description : "Without description"}\n__Required permissions__: ${perms}\n__Required permissions (channel)__: ${perms_channel}\n__Environment__: ${(command.guildonly || command.onlyguild) ? "Server" : "Server and DMs"}\n__Alias__: ${alias}`;
        message.channel.send(str);
      }
      return;
    } else {
      const text = "Use `help <category>` to obtain the category's commands\n\n" + splitMessage(arr.filter(s => {
        if (s.secret) return false;
        if (s.onlyguild && (message.guild ? (message.guild.id !== process.env.GUILD_ID) : true)) return false;
        return true;
      }).map(s => "**" + s.catname + "**: " + s.cat).join("\n"))[0];
      if (checkEmbed(message.channel)) {
        const embed = new Discord.EmbedBuilder()
          .setThumbnail("https://vignette.wikia.nocookie.net/wubbzy/images/7/7d/Gidget.png")
          .setColor("#BDBDBD")
          .setTitle("Help command")
          .addFields([{ name: "Bot lists", value: botlists }])
          .setDescription(text || "?");
        message.channel.send({ embeds: [embed], components: [action] });
      } else {
        const str = `__**Help command**__\n\n${text}`;
        message.channel.send({ content: str, components: [action] });
      }
      return;
    }
  }
}

/**
 * 
 * @param {Discord.Channel} channel The channel to check permissions.
 * @returns {boolean} "true" if you can send embeds, otherwise "false".
 */
function checkEmbed(channel) {
  if (!channel.guild) return true;
  return channel.permissionsFor(channel.guild.members.me.id).has(16384n);
}