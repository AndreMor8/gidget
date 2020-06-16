const { MessageEmbed } = require("discord.js");

module.exports = {
  run: async (bot, message, args) => {
    let info = await bot.fetchApplication()
    const embed = new MessageEmbed()
    .setTitle("Client app information")
    .setThumbnail(info.iconURL({ format: "png" }))
    .setColor("YELLOW")
    .addField("Client ID", info.id)
    .addField("Application name", info.name)
    .addField("Description", info.description)
    .addField("Public bot?", info.botPublic ? "Yes" : "No")
    .addField("Requires OAuth2 code grant?", info.botRequireCodeGrant ? "Yes" : "No")
    .addField("Owner", info.owner.toString())
    message.channel.send(embed);
  },
  aliases: [],
  description: "This fetches the actual bot application on Discord"
}