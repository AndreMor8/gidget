const Discord = require("discord.js");
const MessageModel = require("../../database/models/ticket");
const MessageModel2 = require("../../database/models/message");
module.exports = async (bot, message) => {
  const msgDocument = await MessageModel.findOne({ messageId: message.id });
  if (msgDocument) {
    await msgDocument.deleteOne();
  }

  let s = await MessageModel2.findOne({ messageId: message.id });
  if (s) {
    await msgDocument.deleteOne();
  }


  if (message.partial) return;
  if (message.channel.type === "dm") return;
  if (message.guild.id != "402555684849451028") return;

  if (message.channel.id === "617228699489533953" || message.channel.id === "656991277291667506") return;

  const channel = message.guild.channels.cache.get("656991277291667506");
  if (channel) {
    var auditlog;

    var info;

    try {
      const al = await message.guild.fetchAuditLogs({
        limit: 1
      });
      auditlog = al.entries.first();
    } catch (error) {
      info = "Some error ocurred";
      console.log(error);
    }

    if (info !== "Some error ocurred") {
      if (
        auditlog.action === "MESSAGE_DELETE" &&
        message.author.id === auditlog.target.id
      ) {
        if (auditlog.extra.channel.id === message.channel.id) {
          info =
            "Possibly removed by " +
            auditlog.executor.tag +
            " (Count = " +
            auditlog.extra.count +
            ")";
        } else {
          info = "None, possibly has been removed by the author.";
        }
      } else {
        info = "None, possibly has been removed by the author.";
      }
    }

    const embed = new Discord.MessageEmbed()
      .setTitle("Deleted Message")
      .setDescription(message.content)
      .addField("Author", `${message.author.tag} (${message.author.id})`)
      .addField("Channel", `${message.channel.name} (${message.channel.id})`)
      .addField("Audit Log Info (Not perfect)", info)
      .setTimestamp();

    let urls = [];
    let i = 0;

    if (message.attachments.first()) {
      message.attachments.each(m => {
        urls[i] = m.proxyURL;
        i++;
      });
      embed.addField("Attachments", urls.join(" - "));
    }
    channel.send(embed);
  }
};
