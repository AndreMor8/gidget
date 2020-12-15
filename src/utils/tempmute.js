import MessageModel from '../database/models/muterole.js';
import MessageModel2 from '../database/models/mutedmembers.js';
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
        msgDocument = await MessageModel2.find();
        cache = msgDocument;
        reupdate = false;
      }
      const test = msgDocument[0];
      if (test) {
        for (const i in msgDocument) {
          const date = msgDocument[i].date.getTime();
          if (new Date().getTime() >= date) {
            const another = await MessageModel.findOne({
              guildid: msgDocument[i].guildId
            });
            if (another) {
              const guild = bot.guilds.cache.get(msgDocument[i].guildId);
              if (guild) {
                const role = guild.roles.cache.get(another.muteroleid);
                const member = guild.members.cache.get(msgDocument[i].memberId) || msgDocument[i].memberId ? await guild.members.fetch(msgDocument[i].memberId).catch(() => { }) : undefined;
                if (role && member) {
                  member.roles.remove(role, "Temprestrict - Time over.");
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
    }, 5000);
  }
};
