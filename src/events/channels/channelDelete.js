import MessageModel from "../../database/models/tmembers.js";
import MessageModel2 from "../../database/models/ticket.js";
import MessageModel3 from "../../database/models/poll.js";
export default async (bot, channel) => {
  await MessageModel3.deleteMany({ channelId: channel.id });

  if (channel.guild && channel.guild.available) {
    await MessageModel2.deleteMany({ channelId: channel.id })
    const msgDocument = await MessageModel.findOne({ guildId: channel.guild.id, channelId: channel.id });
    if (msgDocument) {
      const { memberId } = msgDocument;
      const member = await channel.guild.members.fetch(memberId).catch(() => { });
      if (member && channel.guild.me.permissions.has("VIEW_AUDIT_LOG")) {
        const auditlog = await channel.guild.fetchAuditLogs({
          limit: 1,
          type: 12
        }).catch(() => { });
        if (auditlog) {
          const entry = auditlog.entries.first();
          if (entry.executor.id === bot.user.id) return;
          else member.send("Your ticket was deleted by " + entry.executor.tag).catch(() => { });
        }
      }
      msgDocument.deleteOne();
    }
  } else if (channel.isText()) {
    const msgDocument = await MessageModel.findOne({ guildId: channel.guild.id, channelId: channel.id });
    if (msgDocument) msgDocument.deleteOne();
  }
}