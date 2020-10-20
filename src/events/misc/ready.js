import presence from "../../utils/presences.js";
import tempmute from "../../utils/tempmute.js";
import poll from "../../utils/poll.js";
import MessageModel2 from '../../database/models/mutedmembers.js';
import MessageModel3 from '../../database/models/poll.js';
import { version } from "../../index.js";
import webserver from '../../webserver.js';
import discordbl from '../../utils/discordbotlist.js';
//Start ready event
export default async bot => {
  presence(bot);
  discordbl(bot);
  setInterval(discordbl, 900000, bot);
  setInterval(presence, 900000, bot);
  webserver(bot);
  let doc = await MessageModel2.findOne();
  if (doc) {
    tempmute(bot);
  }
  let doc2 = await MessageModel3.findOne();
  if (doc2) {
    poll(bot);
  }
  const guildsToFetch = bot.guilds.cache.filter(e => e.me.hasPermission("MANAGE_GUILD")).array();
  for(const guild of guildsToFetch) {
    guild.inviteCount = await guild.getInviteCount().catch(err => {
      console.log(err);
      return {};
    });
  }
  console.log(`Gidget is alive! Version ` + version);
};