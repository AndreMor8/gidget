import MessageModel from "../../database/models/tmembers.js";
import MessageModel2 from "../../database/models/ticket.js";
import MessageModel3 from "../../database/models/poll.js";

export default async (bot, channel) => {
  await MessageModel3.deleteMany({ channelId: channel.id });

  if (channel.guild && channel.guild.available) {
    MessageModel2.deleteMany({ channelId: channel.id }).exec();
    const msgDocument = await MessageModel.findOne({ guildId: channel.guild.id, channelId: channel.id }).lean().exec();
    if (msgDocument) {
      const { memberId } = msgDocument;
      const member = await channel.guild.members.fetch(memberId).catch(() => { });
      if (member && channel.guild.members.me.permissions.has("ViewAuditLog")) {
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
      MessageModel.findByIdAndDelete(msgDocument._id.toString()).lean().exec();
    }
  } else if (channel.isTextBased()) {
    await MessageModel.deleteOne({ guildId: { $eq: channel.guild.id }, channelId: { $eq: channel.id } });
  }
}