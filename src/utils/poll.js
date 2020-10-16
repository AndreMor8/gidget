import MessageModel from "../database/models/poll.js";
import { Util } from "discord.js";
let i = 0;
let cache;

export default async (bot, reupdate = false) => {
  if (i === 1 && reupdate) {
    i = 0;
    clearInterval(interval);
  }
  if (i === 0) {
    i++;
    var interval = setInterval(async () => {
      let msgDocument;
      if (cache && !reupdate) {
        msgDocument = cache;
      } else {
        let all = await MessageModel.find();
        msgDocument = all.filter(e => bot.channels.cache.has(e.channelId));
        cache = msgDocument;
        reupdate = false;
      }
      let test = msgDocument[0];
      if (test) {
        for (let i in msgDocument) {
          let date = msgDocument[i].date.getTime();
          if (new Date().getTime() >= date) {
            let channel = bot.channels.cache.get(msgDocument[i].channelId);
            if (channel) {
              let message = await channel.messages
                .fetch(msgDocument[i].messageId)
                .catch(err => { });
              if (message) {
                let text = "";
                if (message.reactions && message.reactions.cache.first()) {
                  message.reactions.cache.each(r => {
                    let tosee = r.emoji.id || r.emoji.name;
                    if(!msgDocument[i].reactions.includes(tosee)) return;
                    if (r.partial) {
                      r.fetch().then(r => {
                        text += r.emoji.toString() + " -> " + (r.count - 1) + " votes\n";
                      }).catch(err => { });
                    } else {
                      text += r.emoji.toString() + " -> " + (r.count - 1) + " votes\n";
                    }
                  });
                  await Util.delayFor(1000)
                  let embed = message.embeds[0];
                  embed.setDescription(text).setTitle("Poll completed");
                  await message.edit(embed);
                  if (message.guild.me.hasPermission("MANAGE_MESSAGES")) {
                    message.reactions.removeAll()
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