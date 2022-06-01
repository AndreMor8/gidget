import polls from "../database/models/poll.js";
import fetchAllReactions from "./fetch-all-reactions.js";
import parser from 'twemoji-parser';

export default async (_self, bot) => {
  const msgDocument = (await polls.find().lean()).filter(e => bot.channels.cache.has(e.channelId));
  const test = msgDocument[0];
  if (test) {
    for (const i in msgDocument) {
      (async () => {
        const date = msgDocument[i].date.getTime();
        if (new Date().getTime() >= date) {
          const channel = bot.channels.cache.get(msgDocument[i].channelId);
          if (channel) {
            const message = await channel.messages.fetch(msgDocument[i].messageId).then(e => e.fetch()).catch(() => { });
            if (message) {
              const users = [];
              let text = "";
              for (const r of msgDocument[i].reactions) users.push([r, await fetchAllReactions(message, r)]);
              for (const l of users) text += (parser.parse(l[0])[0] ? l[0] : (l[0].startsWith("a:") ? "<" : "<:") + l[0] + ">") + " -> " + (parseInt(l.length) - 1) + " votes\n";
              const embed = message.embeds[0];
              embed.setDescription(text).setTitle("Poll completed");
              await message.edit({ embeds: [embed] });
              if (message.guild.me.permissions.has("MANAGE_MESSAGES")) {
                message.reactions.removeAll().catch(() => { });
              }
            }
          }
          polls.findByIdAndDelete(msgDocument[i]._id.toString()).lean().exec();
        }
      })().catch(console.error);
    }
  }
}