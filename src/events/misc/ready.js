import presence from "../../utils/presences.js";
import tempmute from "../../utils/tempmute.js";
import poll from "../../utils/poll.js";
import MessageModel2 from '../../database/models/mutedmembers.js';
import MessageModel3 from '../../database/models/poll.js';
import { version } from "../../index.js";
//For clean the interval with a command
export var psi = setInterval(presence, 1800000);
//Start ready event
export default async bot => {
  await import("../../webserver.js")
  presence();
  let doc = await MessageModel2.findOne();
  if (doc) {
    tempmute();
  }
  let doc2 = await MessageModel3.findOne();
  if (doc2) {
    poll();
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