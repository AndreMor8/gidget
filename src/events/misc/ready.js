import presence from "../../utils/presences.js";
import tempmute from "../../utils/tempmute.js";
import poll from "../../utils/poll.js";
import banners from '../../utils/banner.js';
import MessageModel2 from '../../database/models/mutedmembers.js';
import MessageModel3 from '../../database/models/poll.js';
import discordbl from '../../utils/discordbotlist.js';
//Start ready event
export default async bot => {
  //Intervals
  setInterval(presence, 900000, bot);
  if (process.env.EXTERNAL === "yes") {
    discordbl(bot);
    setInterval(discordbl, 1800000, bot);
  }
  //"De-restriction" function once the penalty time has expired
  const doc = await MessageModel2.findOne();
  if (doc) {
    tempmute(bot);
  }
  //Polls have a limit, with this we edit them so that they mark "Poll completed"
  const doc2 = await MessageModel3.findOne();
  if (doc2) {
    poll(bot);
  }

  //WWD will have this always :jiggler:
  banners(bot);
  
  //Show the inviter on the welcome message. Luckily, fetch invites do not have a rate-limit
  try {
    const guildsToFetch = bot.guilds.cache.filter(e => e.me.permissions.has("MANAGE_GUILD")).array();
    for (const guild of guildsToFetch) {
      guild.inviteCount = await guild.getInviteCount().catch(err => {
        console.log(err);
        return {};
      });
    }
  } catch (err) {
    console.error(`In shard ${bot.shard?.ids[0] || 0} there was an error fetching invites.`)
  }

  //All internal operations ended
  presence(bot);
  console.log(`Gidget is alive! Version ${bot.botVersion} from shard ${bot.shard?.ids[0] || 0}`);
};
