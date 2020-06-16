const Discord = require("discord.js");
const MessageModel = require("../../database/models/ticket");
const MessageModel2 = require('../../database/models/tmembers');

module.exports = {
  run: async (bot, message, args) => {
    if(!message.guild) return message.channel.send('This command only works in servers');
    if(message.member.hasPermission("ADMINISTRATOR")) {
    if(!args[1]) return message.channel.send("Put the message ID of that ticket system!");
    let msgDocument = await MessageModel.findOne({
        guildId: message.guild.id,
        messageId: args[1]
      }).catch(err => console.log(err));
      if (msgDocument) {
        msgDocument.deleteOne().then(m => message.channel.send('Ok, I removed that from my database. Remember to delete the message!'));
      } else {
        message.channel.send('I don\'t see a ticket system here.');
      }
    } else {
      message.channel.send('Sorry, you don\'t have permission for that!')
    }
  },
  aliases: [],
  description: "Finish listening tickets"
};
