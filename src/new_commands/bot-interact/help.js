import def from "../../assets/definitions.json" assert {type: "json"};
import Discord from "discord.js";
const buttons = [new Discord.ButtonBuilder().setLabel("Gidget's dashboard").setStyle("Link").setURL("https://gidget.andremor.dev"),
new Discord.ButtonBuilder().setLabel("Bot's documentation").setStyle("Link").setURL("https://docs.gidget.andremor.dev"),
new Discord.ButtonBuilder().setLabel("Source code").setStyle("Link").setURL("https://github.com/AndreMor8/gidget"),
new Discord.ButtonBuilder().setLabel("AndreMor's page").setStyle("Link").setURL("https://andremor.dev"),
new Discord.ButtonBuilder().setLabel("Discord.js documentation").setStyle("Link").setURL("https://discord.js.org/#/docs/")];
const action = Discord.ActionRowBuilder.prototype.addComponents.apply(new Discord.ActionRowBuilder(), buttons)
const botlists = `[MyBOT List](https://portalmybot.com/mybotlist/bot/694306281736896573) | [top.gg](https://top.gg/bot/694306281736896573) | [DiscordBotList](https://discordbotlist.com/bots/gidget)`;
import { splitMessage } from '../../extensions.js';
export default class extends SlashCommand {
  constructor(options) {
    super(options);
    this.deployOptions.description = "Know how to use the bot with this command! (both slash and normal commands)";
    this.deployOptions.options = [{
      name: "to",
      description: "Command or category to go to.",
      type: 3,
      required: false
    }]
  }
  // eslint-disable-next-line require-await
  async run(bot, interaction) {
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
    const to = interaction.options.getString("to", false);
    if (to && arr.find(d => d.catname === to)) {
      const g = arr.find(d => d.catname === to);
      if (checkEmbed(interaction.channel)) {
        const embed = new Discord.EmbedBuilder()
          .setThumbnail("https://vignette.wikia.nocookie.net/wubbzy/images/7/7d/Gidget.png")
          .setColor("#FF8000")
          .setTitle(g.cat + " (" + g.commands.length + " commands)")
          .setDescription(splitMessage(g.commands.filter(s => {
            if (s.secret) return false;
            if (s.onlyguild && (interaction.guild ? (interaction.guild.id !== process.env.GUILD_ID) : true)) return false;
            return true;
          }).map(s => "**" + s.name + "**: " + s.description).join("\n"))[0])
          .setTimestamp()
        await interaction.reply({ embeds: [embed], components: [new Discord.ActionRowBuilder().addComponents([buttons[1]])], ephemeral: true });
      } else {
        const str = `__**${g.cat + " (" + g.commands.length + " commands)"}**__\n\n${splitMessage(g.commands.filter(s => {
          if (s.secret) return false;
          if (s.onlyguild && (interaction.guild ? (interaction.guild.id !== process.env.GUILD_ID) : true)) return false;
          return true;
        }, { maxLength: 1800 }).map(s => "**" + s.name + "**: " + s.description).join("\n"))[0]}`;
        await interaction.reply({ content: str, components: [new Discord.ActionRowBuilder().addComponents([buttons[1]])], ephemeral: true });
      }
      return;
    } else if (to && (bot.commands.get(to.toLowerCase()) || bot.commands.find(c => c.aliases.includes(to.toLowerCase())))) {
      const command = bot.commands.get(to.toLowerCase()) || bot.commands.find(c => c.aliases.includes(to.toLowerCase()));
      if (command.dev || command.owner) return await interaction.reply({ ephemeral: true, content: "Exclusive command for the owner or developers" });
      let alias = "Without alias";
      if (command.aliases.length !== 0) {
        alias = command.aliases.join(", ");
      }
      if (checkEmbed(interaction.channel)) {
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
          .setTimestamp();
        await interaction.reply({ embeds: [embed], ephemeral: true });
      } else {
        const perms = `User: \`${!(new Discord.PermissionsBitField(command.permissions.user[0]).has(8n)) ? (new Discord.PermissionsBitField(command.permissions.user[0]).toArray().join(", ") || "None") : "Administrator"}\`\nBot: \`${!(new Discord.PermissionsBitField(command.permissions.bot[0]).has(8n)) ? (new Discord.PermissionsBitField(command.permissions.bot[0]).toArray().join(", ") || "None") : "Administrator"}\``;
        const perms_channel = `User: \`${!(new Discord.PermissionsBitField(command.permissions.user[1]).has(8n)) ? (new Discord.PermissionsBitField(command.permissions.user[1]).toArray().join(", ") || "None") : "Administrator"}\`\nBot: \`${!(new Discord.PermissionsBitField(command.permissions.bot[1]).has(8n)) ? (new Discord.PermissionsBitField(command.permissions.bot[1]).toArray().join(", ") || "None") : "Administrator"}\``;
        const str = `__**Gidget help - ${command.name}**__\n\n__Description__: ${command.description ? command.description : "Without description"}\n__Required permissions__: ${perms}\n__Required permissions (channel)__: ${perms_channel}\n__Environment__: ${(command.guildonly || command.onlyguild) ? "Server" : "Server and DMs"}\n__Alias__: ${alias}`;
        await interaction.reply({ content: str, ephemeral: true });
      }
      return;
    } else {
      const text = "Use `help <category>` to obtain the category's commands\n\n" + splitMessage(arr.filter(s => {
        if (s.secret) return false;
        if (s.onlyguild && (interaction.guild ? (interaction.guild.id !== process.env.GUILD_ID) : true)) return false;
        return true;
      }).map(s => "**" + s.catname + "**: " + s.cat).join("\n"))[0];
      if (checkEmbed(interaction.channel)) {
        const embed = new Discord.EmbedBuilder()
          .setThumbnail("https://vignette.wikia.nocookie.net/wubbzy/images/7/7d/Gidget.png")
          .setColor("#BDBDBD")
          .setTitle("Help command")
          .addFields([{ name: "Bot lists", value: botlists }])
          .setDescription(text || "?");
        await interaction.reply({ embeds: [embed], components: [action], ephemeral: true });
      } else {
        const str = `__**Help command**__\n\n${text}`;
        await interaction.reply({ content: str, components: [action], ephemeral: true });
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