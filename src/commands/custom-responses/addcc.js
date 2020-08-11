const MessageModel = require("../../database/models/customresponses");
const Discord = require("discord.js")
module.exports = {
  run: async (bot, message = new Discord.Message(), args) => {
    if (!message.member.hasPermission("ADMINISTRATOR")) {
      if(message.author.id !== "577000793094488085") {
        return message.reply(`you do not have permission to execute this command.`);
      }
    }
    if (!args[1])
      return message.channel.send(
        "Usage: `addcc <match> | <response>`\nThe cases here are global, insensitive, and multi-line."
      );
    const realargs = args
      .slice(1)
      .join(" ")
      .split(" | ");
    if (!realargs[0] || !realargs[1])
      return message.channel.send(
        "Usage: `addcc <match> | <response>`\nThe cases here are global, insensitive, and multi-line."
      );
    await message.guild.addCustomResponse(realargs[0], {
      content: realargs[1],
      files: message.attachments.map(e => e.url),
    })
    message.channel.send("Custom response set correctly");
  },
  aliases: [],
  description: "Add custom responses in the database."
};
