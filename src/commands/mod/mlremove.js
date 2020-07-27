const MessageModel = require("../../database/models/roles");
module.exports = {
  run: async (bot, message, args) => {
    if(!message.guild) return message.channel.send('This command only works in servers');
    if (message.guild.id !== '402555684849451028') return message.channel.send('This command only works on Wow Wow Discord.')
    if(!message.member.hasPermission("ADMINISTRATOR")) return message.reply("you don't have permissions");
    const msgDocument = MessageModel.findOne({ guildid: message.guild.id, memberid: args[1] });
    if(msgDocument) {
      msgDocument.deleteOne().then(() => message.channel.send("I removed that user from my database")).catch(err => message.channel.send("Some error ocurred. Here's a debug: " + err));
    } else {
      message.channel.send('That user isn\'t in my database');
    }
  },
  aliases: [],
  description: "Removes a user from the guild list of roles to retrieve",
}