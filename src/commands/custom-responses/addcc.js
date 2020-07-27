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
    const msgDocument = await MessageModel.findOne({
      guildId: message.guild.id
    });
    if (!msgDocument) {
      const responses = {};
      const files = [];
      if (message.attachments.first()) {
        message.attachments.each(a => {
          files.push(a.url);
        });
      }
      Object.defineProperty(responses, realargs[0], {
        value: { content: realargs[1], files: files },
        writable: true,
        enumerable: true,
        configurable: true
      });
      const tosave = new MessageModel({
        guildId: message.guild.id,
        responses: responses
      });
      tosave
        .save()
        .then(() => {
          bot.autoresponsecache.delete(message.guild.id);
          message.channel.send("Custom response set correctly.");
        })
        .catch(err =>
          message.channel.send("Some error ocurred. Here's a debug: " + err)
        );
    } else {
      const { responses } = msgDocument;
      const files = [];
      if (message.attachments.first()) {
        message.attachments.each(a => {
          files.push(a.url);
        });
      }
      Object.defineProperty(responses, realargs[0], {
        value: { content: realargs[1], files: files },
        writable: true,
        enumerable: true,
        configurable: true
      });
      msgDocument
        .updateOne({ responses: responses })
        .then(() => {
          bot.autoresponsecache.delete(message.guild.id);
          message.channel.send("Custom response set correctly.");
        })
        .catch(err =>
          message.channel.send("Some error ocurred. Here's a debug: " + err)
        );
    }
  },
  aliases: [],
  description: "Add custom responses in the database."
};
