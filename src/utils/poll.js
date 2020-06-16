const { bot } = require("../index.js");
const MessageModel = require("../database/models/poll.js");
let i = 0;
let cache;

module.exports = async (reupdate = false) => {
  if(i === 1 && reupdate) {
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
        msgDocument = await MessageModel.find();
        cache = msgDocument;
        reupdate = false;
      }
      let test = msgDocument[0];
      if (test) {
        for (let i in msgDocument) {
          let date = msgDocument[i].date.getTime();
          if (new Date().getTime() >= date) {
            let channel = await bot.channels.cache.get(
              msgDocument[i].channelId
            );
            if (channel) {
              let message = await channel.messages
                .fetch(msgDocument[i].messageId)
                .catch(err => {});
              if (message) {
                let text = "";
                if (message.reactions && message.reactions.cache.first()) {
                  let reactions = message.reactions.cache.each(r => {
                    if (r.partial) {
                      r.fetch()
                        .then(r => {
                          text +=
                            r.emoji.toString() +
                            " -> " +
                            (r.count - 1) +
                            " votes\n";
                        })
                        .catch(err => {});
                    } else {
                      text +=
                        r.emoji.toString() +
                        " -> " +
                        (r.count - 1) +
                        " votes\n";
                    }
                  });
                  let embed = message.embeds[0];
                  embed.setDescription(text).setTitle("Poll completed");
                  await message.edit(embed);
                  if(message.guild.me.hasPermission("MANAGE_MESSAGES")) {
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