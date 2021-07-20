import def from "../../assets/definitions.json";
import Discord from "discord.js-light";
const buttons = [new Discord.MessageButton().setLabel("Gidget's dashboard").setStyle("LINK").setURL("https://gidget.xyz"),
new Discord.MessageButton().setLabel("Bot's documentation").setStyle("LINK").setURL("https://docs.gidget.xyz"),
new Discord.MessageButton().setLabel("Source code").setStyle("LINK").setURL("https://github.com/AndreMor8/gidget"),
new Discord.MessageButton().setLabel("AndreMor's page").setStyle("LINK").setURL("https://andremor.ml"),
new Discord.MessageButton().setLabel("Discord.js documentation").setStyle("LINK").setURL("https://discord.js.org/#/docs/")];
const action = Discord.MessageActionRow.prototype.addComponents.apply(new Discord.MessageActionRow(), buttons)
const botlists = `[MyBOT List](https://portalmybot.com/mybotlist/bot/694306281736896573) | [top.gg](https://top.gg/bot/694306281736896573) | [DiscordBotList](https://discordbotlist.com/bots/gidget) | [Discord Boats](https://discord.boats/bot/694306281736896573)`;
export default class extends SlashCommand {
  constructor(options) {
    super(options);
    this.deployOptions.description = "Know how to use the bot with this command! (both slash and normal commands)";
    this.deployOptions.options = [{
      name: "to",
      description: "Command or category to go to.",
      type: "STRING",
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
    const to = interaction.options.get("to")?.value;
    if (to && arr.find(d => d.catname === to)) {
      const g = arr.find(d => d.catname === to);
      if (checkEmbed(interaction.channel)) {
        const embed = new Discord.MessageEmbed()
          .setThumbnail("https://vignette.wikia.nocookie.net/wubbzy/images/7/7d/Gidget.png")
          .setColor("#FF8000")
          .setTitle(g.cat + " (" + g.commands.length + " commands)")
          .setDescription(Discord.Util.splitMessage(g.commands.filter(s => {
            if (s.secret) return false;
            if (s.onlyguild && (interaction.guild ? (interaction.guild.id !== process.env.GUILD_ID) : true)) return false;
            return true;
          }).map(s => "**" + s.name + "**: " + s.description).join("\n"))[0])
          .setTimestamp()
        interaction.reply({ embeds: [embed], components: [[buttons[1]]], ephemeral: true });
      } else {
        const str = `__**${g.cat + " (" + g.commands.length + " commands)"}**__\n\n${Discord.Util.splitMessage(g.commands.filter(s => {
          if (s.secret) return false;
          if (s.onlyguild && (interaction.guild ? (interaction.guild.id !== process.env.GUILD_ID) : true)) return false;
          return true;
        }, { maxLength: 1800 }).map(s => "**" + s.name + "**: " + s.description).join("\n"))[0]}`;
        interaction.reply({ content: str, components: [[buttons[1]]], ephemeral: true });
      }
      return;
    } else if (to && (bot.commands.get(to.toLowerCase()) || bot.commands.find(c => c.aliases.includes(to.toLowerCase())))) {
      const command = bot.commands.get(to.toLowerCase()) || bot.commands.find(c => c.aliases.includes(to.toLowerCase()));
      if (command.dev || command.owner) return interaction.reply({ ephemeral: true, content: "Exclusive command for the owner or developers" });
      let alias = "Without alias";
      if (command.aliases.length !== 0) {
        alias = command.aliases.join(", ");
      }
      if (checkEmbed(interaction.channel)) {
        const embed = new Discord.MessageEmbed()
          .setThumbnail("https://vignette.wikia.nocookie.net/wubbzy/images/7/7d/Gidget.png")
          .setTitle(`Gidget help - ${command.name}`)
          .addField("Description", command.description ? command.description : "Without description")
          .addField("Required permissions", `User: \`${!(new Discord.Permissions(command.permissions.user[0]).has(8n)) ? (new Discord.Permissions(command.permissions.user[0]).toArray().join(", ") || "None") : "ADMINISTRATOR"}\`\nBot: \`${!(new Discord.Permissions(command.permissions.bot[0]).has(8n)) ? (new Discord.Permissions(command.permissions.bot[0]).toArray().join(", ") || "None") : "ADMINISTRATOR"}\``)
          .addField("Required permissions (channel)", `User: \`${!(new Discord.Permissions(command.permissions.user[1]).has(8n)) ? (new Discord.Permissions(command.permissions.user[1]).toArray().join(", ") || "None") : "ADMINISTRATOR"}\`\nBot: \`${!(new Discord.Permissions(command.permissions.bot[1]).has(8n)) ? (new Discord.Permissions(command.permissions.bot[1]).toArray().join(", ") || "None") : "ADMINISTRATOR"}\``)
          .addField("Environment", (command.guildonly || command.onlyguild) ? "Server" : "Server and DMs")
          .addField("Alias", alias)
          .setColor('#FFFFFF')
          .setTimestamp();
        interaction.reply({ embeds: [embed], ephemeral: true });
      } else {
        const perms = `User: \`${!(new Discord.Permissions(command.permissions.user[0]).has(8n)) ? (new Discord.Permissions(command.permissions.user[0]).toArray().join(", ") || "None") : "ADMINISTRATOR"}\`\nBot: \`${!(new Discord.Permissions(command.permissions.bot[0]).has(8n)) ? (new Discord.Permissions(command.permissions.bot[0]).toArray().join(", ") || "None") : "ADMINISTRATOR"}\``;
        const perms_channel = `User: \`${!(new Discord.Permissions(command.permissions.user[1]).has(8n)) ? (new Discord.Permissions(command.permissions.user[1]).toArray().join(", ") || "None") : "ADMINISTRATOR"}\`\nBot: \`${!(new Discord.Permissions(command.permissions.bot[1]).has(8n)) ? (new Discord.Permissions(command.permissions.bot[1]).toArray().join(", ") || "None") : "ADMINISTRATOR"}\``;
        const str = `__**Gidget help - ${command.name}**__\n\n__Description__: ${command.description ? command.description : "Without description"}\n__Required permissions__: ${perms}\n__Required permissions (channel)__: ${perms_channel}\n__Environment__: ${(command.guildonly || command.onlyguild) ? "Server" : "Server and DMs"}\n__Alias__: ${alias}`;
        interaction.reply({ content: str, ephemeral: true });
      }
      return;
    } else {
      const text = "Use `help <category>` to obtain the category's commands\n\n" + Discord.Util.splitMessage(arr.filter(s => {
        if (s.secret) return false;
        if (s.onlyguild && (interaction.guild ? (interaction.guild.id !== process.env.GUILD_ID) : true)) return false;
        return true;
      }).map(s => "**" + s.catname + "**: " + s.cat).join("\n"))[0];
      if (checkEmbed(interaction.channel)) {
        const embed = new Discord.MessageEmbed()
          .setThumbnail("https://vignette.wikia.nocookie.net/wubbzy/images/7/7d/Gidget.png")
          .setColor("#BDBDBD")
          .setTitle("Help command")
          .addField("Bot lists", botlists)
          .setDescription(text || "?");
        interaction.reply({ embeds: [embed], components: [action], ephemeral: true });
      } else {
        const str = `__**Help command**__\n\n${text}`;
        interaction.reply({ content: str, components: [action], ephemeral: true });
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
  return channel.permissionsFor(channel.guild.me.id).has(16384n);
}