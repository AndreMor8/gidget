import { Util, MessageEmbed, MessageButton, MessageActionRow } from "discord.js";
export default class extends Command {
  constructor(options) {
    super(options);
    this.aliases = ["emoji"];
    this.description = "Get information from an emoji.";
    this.guildonly = true;
    this.permissions = {
      user: [0n, 0n],
      bot: [0n, 16384n]
    };
  }
  async run(bot, message, args) {
    if (!message.guild)
      return message.channel.send("This command only works on servers.");
    if (!args[1])
      return message.channel.send("Usage: emoji <emoji>");
    let emoji = bot.emojis.cache.get(args[1]) ||
      bot.emojis.cache.find(e => e.name === args[1]) || await message.guild.emojis.fetch(args[1]).catch(() => { });
    if (!emoji) {
      const e = Util.parseEmoji(args[1]);
      if (!e.id)
        emoji = bot.emojis.cache.find(a => a.name === e.name);
      else
        emoji = bot.emojis.cache.get(e.id) || await message.guild.emojis.fetch(e.id).catch(() => { });
      if (!emoji)
        return message.channel.send("Invalid emoji!");
    }

    let auth = emoji.author;
    if (!auth && message.guild.me.permissions.has("MANAGE_EMOJIS") && emoji.guild.id === message.guild.id) {
      auth = await emoji.fetchAuthor();
    } else if (!auth) {
      auth = "*Without perms to see that*";
    }
    const embed = new MessageEmbed()
      .setTitle("Emoji info for " + emoji.name)
      .setThumbnail(emoji.url)
      .setColor("RANDOM")
      .addField("ID", emoji.id, true)
      .addField("Use", "`" + emoji.toString() + "`", true)
      .addField("Animated?", emoji.animated ? "Yes" : "No", true)
      .addField("Managed?", emoji.managed ? "Yes" : "No", true)
      .addField("Requires colons?", emoji.requiresColons ? "Yes" : "No", true)
      .addField("Available", emoji.available ? "Yes" : "No", true)
      .setFooter("Created at")
      .setTimestamp(emoji.createdAt);
    if (emoji.guild.id === message.guild.id) {
      embed.addField("Author", auth.toString(), true)
        .addField("Roles that can use the emoji", emoji.roles.cache.first() ? emoji.roles.cache.map(e => `${e}`).join(", ") : "@everyone");
    }
    const but_emoji_link = new MessageButton()
      .setStyle("LINK")
      .setURL(emoji.url)
      .setLabel("Emoji link/URL");
    await message.channel.send({ embeds: [embed], components: [new MessageActionRow().addComponents([but_emoji_link])] });
  }
}