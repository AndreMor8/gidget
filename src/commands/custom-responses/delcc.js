const MessageModel = require("../../database/models/customresponses");

module.exports = {
  run: async (bot, message, args) => {
    if (!args[1]) return message.channel.send("Usage: `delcc <id>`\nUse `listcc` for a ID.");
    if(isNaN(args[1])) return message.channel.send("Invalid ID!");
    await message.guild.deleteCustomResponse(parseInt(args[1]));
    message.channel.send("Custom response deleted correctly");
  },
  aliases: [],
  description: "Delete a custom response from the database",
  guildonly: true,
  permissions: {
    user: [8, 0],
    bot: [0, 0]
  }
};
