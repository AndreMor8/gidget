import presence from "../../utils/presences.js";
import tempmute from "../../utils/tempmute.js";
import poll from "../../utils/poll.js";
import MessageModel2 from '../../database/models/mutedmembers.js';
import MessageModel3 from '../../database/models/poll.js';
import webserver from '../../webserver.js';
import discordbl from '../../utils/discordbotlist.js';
//Start ready event
export default async bot => {
  //Intervals
  presence(bot);
  if (process.env.EXTERNAL === "yes") {
    discordbl(bot);
    setInterval(discordbl, 1800000, bot);
  }
  setInterval(presence, 900000, bot);
  //Webserver for cache cleaning
  webserver(bot);
  //"De-restriction" function once the penalty time has expired
  let doc = await MessageModel2.findOne();
  if (doc) {
    tempmute(bot);
  }
  //Polls have a limit, with this we edit them so that they mark "Poll completed"
  let doc2 = await MessageModel3.findOne();
  if (doc2) {
    poll(bot);
  }
  //Show the inviter on the welcome message. Luckily, fetch invites do not have a rate-limit
  const guildsToFetch = bot.guilds.cache.filter(e => e.me.hasPermission("MANAGE_GUILD")).array();
  for (const guild of guildsToFetch) {
    guild.inviteCount = await guild.getInviteCount().catch(err => {
      console.log(err);
      return {};
    });
  }

  //All internal operations ended
  console.log(`Gidget is alive! Version ` + global.botVersion);
};
