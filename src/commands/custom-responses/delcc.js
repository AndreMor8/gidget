const MessageModel = require("../../database/models/customresponses");

module.exports = {
  run: async (bot, message, args) => {
    if (!message.member.hasPermission("ADMINISTRATOR")) {
      if(message.author.id !== "577000793094488085") {
        return message.reply(`you do not have permission to execute this command.`);
      }
    }
    if (!args[1]) return message.channel.send("Usage: `delcc <id>`\nUse `listcc` for a ID.");
    if(!isNaN(args[1])) return message.channel.send("Invalid ID!");
    await message.guild.deleteCustomResponse(parseInt(args[1]));
    message.channel.send("Custom response deleted correctly");
  },
  aliases: [],
  description: "Delete a custom response from the database"
};
