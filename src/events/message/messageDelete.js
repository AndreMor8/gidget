import Discord from "discord.js";
import MessageModel from "../../database/models/ticket.js";
import MessageModel2 from "../../database/models/message.js";
import MessageModel3 from "../../database/models/poll.js";
export default async (bot, message) => {
  await MessageModel.findOneAndDelete({ messageId: message.id });

  await MessageModel2.findOneAndDelete({ messageId: message.id });

  await MessageModel3.findOneAndDelete({ messageId: message.id });


  if (message.partial) return;
  if (!message.guild) return;

  message.channel.snipe = message;

  //Things for Wow Wow Discord
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
