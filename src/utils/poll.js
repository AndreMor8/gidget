import polls from "../database/models/poll.js";
import fetchAllReactions from "./fetch-all-reactions.js";
import parser from 'twemoji-parser';
import { EmbedBuilder } from "discord.js";

export default async (_self, bot) => {
  const msgDocument = (await polls.find().lean()).filter(e => bot.channels.cache.has(e.channelId));
  const test = msgDocument[0];
  if (test) {
    for (const doc of msgDocument) {
      (async () => {
        const date = doc.date.getTime();
        if (new Date().getTime() >= date) {
          const guild = await bot.guilds.cache.get(doc.guildId);
          if (guild) {
            if (typeof guild.shardId === "number" && guild.shardId === bot.shard.ids[0]) {
              const channel = await guild.channels.fetch(doc.channelId).catch(() => { });
              if (channel) {
                const message = await channel.messages.fetch({ message: doc.messageId }).then(e => e.fetch()).catch(() => { });
                if (message) {
                  const users = [];
                  let text = "";
                  for (const r of doc.reactions) users.push([r, await fetchAllReactions(message, parser.parse(r)[0] ? r : r.split(":")[1])]);
                  for (const l of users) text += (parser.parse(l[0])[0] ? l[0] : (l[0].startsWith("a:") ? "<" : "<:") + l[0] + ">") + " -> " + (l[1].filter(u => !u.bot).length) + " votes\n";
                  const embed = EmbedBuilder.from(message.embeds[0]);
                  embed.setDescription(text).setTitle("Poll completed");
                  await message.edit({ embeds: [embed] });
                  if (message.channel.permissionsFor(bot.user.id).has("ManageMessages")) message.reactions.removeAll().catch(() => { });
                }
              }
            }
          }
          await polls.findByIdAndDelete(doc._id.toString()).lean().exec();
        }
      })().catch(console.error);
    }
  }
}