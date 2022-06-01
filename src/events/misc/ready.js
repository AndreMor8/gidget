import cron from 'croner';
import presence from "../../utils/presences.js";
import tempmute from "../../utils/tempmute.js";
import poll from "../../utils/poll.js";
import banners from '../../utils/banner.js';
import MessageModel2 from '../../database/models/mutedmembers.js';
import discordbl from '../../utils/discordbotlist.js';
import { getInviteCount } from "../../extensions.js";
//Start ready event
export default async bot => {
  //Intervals
  cron("*/30 * * * *", presence, { context: bot });
  if (process.env.EXTERNAL === "yes") {
    discordbl(null, bot);
    cron("0 * * * *", discordbl, { context: bot });
  }

  const doc = await MessageModel2.findOne();
  if (doc) tempmute(bot);

  cron("* * * * *", poll, { context: bot });
  cron("* * * * *", banners, { context: bot });

  //Show the inviter on the welcome message. Luckily, fetch invites do not have a rate-limit
  try {
    const guildsToFetch = [...bot.guilds.cache.filter(e => e.me.permissions.has("MANAGE_GUILD")).values()];
    for (const guild of guildsToFetch) {
      guild.inviteCount = await getInviteCount(guild).catch(err => {
        console.log(err);
        return {};
      });
    }
  } catch (err) {
    console.error(`In shard ${bot.shard?.ids[0] || 0} there was an error fetching invites.`)
  }

  //All internal operations ended
  await presence(null, bot);
  console.log(`Gidget is alive! Version ${bot.botVersion} from shard ${bot.shard?.ids[0] || 0}`);
};
