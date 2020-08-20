const { Util, MessageEmbed } = require("discord.js");
module.exports = {
  run: async (bot, message, args) => {
    if (!message.guild)
      return message.channel.send("This command only works on servers.");
    if (!args[1]) return message.channel.send("Usage: emoji <emoji>");
    let emoji =
      bot.emojis.cache.get(args[1]) ||
      bot.emojis.cache.find(e => e.name === args[1]);
    if (!emoji) {
      let e = Util.parseEmoji(args[1]);
      if (!e.id) emoji = bot.emojis.cache.find(a => a.name === e.name);
      else emoji = bot.emojis.cache.get(e.id);
      if (!emoji) return message.channel.send("Invalid emoji!");
    }

    let auth = emoji.author;
    if (!auth && message.guild.me.hasPermission("MANAGE_EMOJIS") && emoji.guild.id === message.guild.id) {
      auth = await emoji.fetchAuthor();
    } else if(!auth) {
      auth = "*Without perms to see that*";
    }
    const embed = new MessageEmbed()
      .setTitle("Emoji info for " + emoji.name)
      .setThumbnail(emoji.url)
      .setColor("RANDOM")
      .addField("ID", emoji.id, true)
      .addField("URL", `[Click here](${emoji.url})`, true)
      .addField("Use", "`" + emoji.toString() + "`", true)
      .addField("Animated?", emoji.animated ? "Yes" : "No", true)
      .addField("Managed?", emoji.managed ? "Yes" : "No", true)
      .addField("Requires colons?", emoji.requiresColons ? "Yes" : "No", true)
      .addField("Available", emoji.available ? "Yes" : "No", true)
      .setFooter("Created at")
      .setTimestamp(emoji.createdAt);
    if (emoji.guild.id === message.guild.id) {
      embed.addField("Author", auth, true)
      .addField("Roles that can use the emoji", emoji.roles.cache.first() ? emoji.roles.cache.map(e => `${e}`).join(", ") : "@everyone");
    }
    message.channel.send(embed);
  },
  aliases: ["emoji"],
  description: "Get information from an emoji.",
  guildonly: true,
  permissions: {
    user: [0, 0],
    bot: [0, 16384]
  }
};
