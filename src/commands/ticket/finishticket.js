const Discord = require("discord.js");
const MessageModel = require("../../database/models/ticket");
const MessageModel2 = require('../../database/models/tmembers');

module.exports = {
  run: async (bot, message, args) => {
    if (!args[1]) return message.channel.send("Put the message ID of that ticket system!");
    let msgDocument = await MessageModel.findOne({
      guildId: message.guild.id,
      messageId: args[1]
    }).catch(err => console.log(err));
    if (msgDocument) {
      msgDocument.deleteOne().then(m => message.channel.send('Ok, I removed that from my database. Remember to delete the message!'));
    } else {
      message.channel.send('I don\'t see a ticket system here.');
    }
  },
  aliases: [],
  description: "Finish listening tickets",
  guildonly: true,
  permissions: {
    user: [8, 0],
    bot: [0, 0]
  }
};
