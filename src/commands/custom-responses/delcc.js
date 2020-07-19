const MessageModel = require("../../database/models/customresponses");

module.exports = {
  run: async (bot, message, args) => {
    if (!message.member.hasPermission("ADMINISTRATOR")) {
      if(message.author.id !== "577000793094488085") {
        return message.reply(`you do not have permission to execute this command.`);
      }
    }
    if (!args[1])
      return message.channel.send(
        "Usage: `delcc <id>`\nUse `listcc` for a ID."
      );
    const msgDocument = await MessageModel.findOne({
      guildId: message.guild.id
    });
    if (msgDocument) {
      const { responses } = msgDocument;
      const id = parseInt(args[1]);
      const keys = Object.keys(responses);
      if (id <= keys.length && id >= 1) {
        let word = keys[id - 1];
        if (responses.hasOwnProperty(word)) {
          delete responses[word];
          const a = Object.keys(responses);
          if (a.length < 1) {
            msgDocument
              .deleteOne()
              .then(() => {
                bot.autoresponsecache.delete(message.guild.id);
                message.channel.send("Custom response set correctly.");
              })
              .catch(err =>
                message.channel.send(
                  "Some error ocurred. Here's a debug: " + err
                )
              );
          } else {
            msgDocument
              .updateOne({ responses: responses })
              .then(() => {
                bot.autoresponsecache.delete(message.guild.id);
                message.channel.send("Custom response set correctly.");
              })
              .catch(err =>
                message.channel.send(
                  "Some error ocurred. Here's a debug: " + err
                )
              );
          }
        } else message.channel.send("?");
      }
    } else
      return message.channel.send(
        "There are no custom responses on this server..."
      );
  },
  aliases: [],
  description: "Delete a custom response from the database"
};
