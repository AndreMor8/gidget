const MessageModel = require("../../database/models/roles");
module.exports = {
  run: async (bot, message, args) => {
    const msgDocument = MessageModel.findOne({ guildid: message.guild.id, memberid: args[1] });
    if(msgDocument) {
      msgDocument.deleteOne().then(() => message.channel.send("I removed that user from my database")).catch(err => message.channel.send("Some error ocurred. Here's a debug: " + err));
    } else {
      message.channel.send('That user isn\'t in my database');
    }
  },
  aliases: [],
  guildonly: true,
  description: "Removes a user from the guild list of roles to retrieve",
  permissions: {
    user: [8, 0],
    bot: [0, 0]
  }
}