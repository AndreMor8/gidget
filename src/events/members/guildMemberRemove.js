import MessageModel from "../../database/models/roles.js";
import MessageModel2 from "../../database/models/retreiveconfig.js";
import MessageModel3 from "../../database/models/mutedmembers.js";
export default async (bot, member) => {
  //const date = new Date();

  /* Temp-mute function - Delete the member if they left the server */
  await MessageModel3.findOneAndDelete({ guildId: member.guild.id, memberId: member.id }).catch(() => { });

  /* Retrieving-roles function */
  //I don't want errors..
  if (!member.partial) {
    //A cache system
    let verify = bot.rrcache.get(member.guild.id)
    if (!verify) {
      verify = await MessageModel2.findOne({ guildId: member.guild.id })
    }
    if (verify && verify.enabled) {
      let msgDocument = await MessageModel.findOne({
        guildid: member.guild.id,
        memberid: member.user.id
      });

      //List roles
      let roles = member.roles.cache
        .filter(r => !r.deleted && !r.managed && r.id !== member.guild.id)
        .map(r => r.id);

      //Save to the DB
      if (roles.length) {
        if (msgDocument) {
          msgDocument.updateOne({ roles: roles }).catch(console.error);
        } else {
          let dbMsgModel = new MessageModel({
            guildid: member.guild.id,
            memberid: member.user.id,
            roles: roles
          });
          dbMsgModel.save().catch(console.error);
        }
      } else {
        //They have no roles, and are still in the DB in previous sessions.
        if (msgDocument) {
          msgDocument.deleteOne();
        }
      }
    }
  }
  const welcome = member.guild.cache.welcome ? member.guild.welcome : await member.guild.getWelcome();
  if (welcome && welcome.leaveenabled && welcome.leavetext) {
    const channel = member.guild.channels.cache.get(welcome.leavechannelID);
    if (channel && ["news", "text"].includes(channel.type) && channel.permissionsFor(member.guild.me).has(["VIEW_CHANNEL", "SEND_MESSAGES"])) {
      const memberTag = member.user.tag || await bot.users.fetch(member.id).then(e => e.tag).catch(() => { }) || "Unknown";
      let finalText = welcome.leavetext.replace(/%MEMBER%/gmi, member.toString()).replace(/%SERVER%/gmi, member.guild.name).replace(/%MEMBERTAG%/gmi, memberTag);
      await channel.send(finalText || "?").catch(() => { });
    }
  }
};