import MessageModel from "../database/models/poll.js";
import { Util } from "discord.js";
let i = 0;
let cache;

export default (bot, reupdate = false) => {
  if (i === 1 && reupdate) {
    i = 0;
    clearInterval(interval);
  }
  if (i === 0) {
    i++;
    //Still untested
    // eslint-disable-next-line no-var
    var interval = setInterval(async () => {
      let msgDocument;
      if (cache && !reupdate) {
        msgDocument = cache;
      } else {
        const all = await MessageModel.find();
        msgDocument = all.filter(e => bot.channels.cache.has(e.channelId));
        cache = msgDocument;
        reupdate = false;
      }
      const test = msgDocument[0];
      if (test) {
        for (const i in msgDocument) {
          const date = msgDocument[i].date.getTime();
          if (new Date().getTime() >= date) {
            const channel = bot.channels.cache.get(msgDocument[i].channelId);
            if (channel) {
              const message = await channel.messages
                .fetch(msgDocument[i].messageId)
                .catch(() => { });
              if (message) {
                let text = "";
                if (message.reactions && message.reactions.cache.first()) {
                  message.reactions.cache.each(r => {
                    const tosee = r.emoji.identifier;
                    if (!msgDocument[i].reactions.includes(tosee)) return;
                    if (r.partial) {
                      r.fetch().then(r => {
                        text += r.emoji.toString() + " -> " + (r.count - 1) + " votes\n";
                      }).catch(() => { });
                    } else {
                      text += r.emoji.toString() + " -> " + (r.count - 1) + " votes\n";
                    }
                  });
                  await Util.delayFor(1500);
                  const embed = message.embeds[0];
                  embed.setDescription(text).setTitle("Poll completed");
                  await message.edit({embeds: [embed]});
                  if (message.guild.me.permissions.has("MANAGE_MESSAGES")) {
                    message.reactions.removeAll().catch(() => {});
                  }
                }
              }
            }
            msgDocument[i].deleteOne();
            reupdate = true;
          }
        }
      } else {
        i = 0;
        cache = undefined;
        clearInterval(interval);
      }
    }, 20000);
  }
};