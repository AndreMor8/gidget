const MessageModel = require("../../database/models/roles");
const MessageModel2 = require("../../database/models/retreiveconfig");
const MessageModel3 = require("../../database/models/mutedmembers");
module.exports = async (bot, member) => {
  //const date = new Date();

  /* Temp-mute function - Delete the member if they left the server */
  await MessageModel3.findOneAndDelete({ guildId: member.guild.id, memberId: member.id }).catch(err => {});

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
      if (roles.length >= 1) {
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
    if(welcome && welcome.leaveenabled && welcome.leavetext) {
      const channel = member.guild.channels.cache.get(welcome.leavechannelID);
      if (channel && ["news", "text"].includes(channel.type) && channel.permissionsFor(member.guild.me).has(["VIEW_CHANNEL", "SEND_MESSAGES"])) {
        let finalText = welcome.leavetext.replace(/%MEMBER%/gmi, member.toString()).replace(/%SERVER%/gmi, member.guild.name);
        await channel.send(finalText || "?").catch(err => {});
      }
    }
  /*
  //Things for Wow Wow Discord
  if (member.guild.id !== "402555684849451028") return;
  const channel = member.guild.channels.cache.get("402555684849451030");
  if (!channel) return;
  if (!bot.users.cache.has(member.id)) {
    const user = bot.users.fetch(member.id).then(async m => {
      await sendMessage(bot, m, channel, date, member, true);
    });
  } else {
    sendMessage(bot, member, channel, date)
  }
  */
};
/*
async function sendMessage(bot, member, channel, date, realmember, user = false) {
  await bot.users.fetch(member.user.id);
  let auditlog;

  let info;

  if (user) {
    try {
      const al = await realmember.guild.fetchAuditLogs({
        limit: 1
      });
      auditlog = al.entries.first();
    } catch (error) {
      info = "Some error ocurred";
      console.log(error);
    }
  } else {
    try {
      const al = await member.guild.fetchAuditLogs({
        limit: 1
      });
      auditlog = al.entries.first();
    } catch (error) {
      info = "Some error ocurred";
      console.log(error);
    }
  }

  if (info !== "Some error ocurred") {
    if ((auditlog.action === "MEMBER_KICK" || auditlog.action === "MEMBER_BAN_ADD") && member.id === auditlog.target.id) {
      if (date.getMinutes() === auditlog.createdAt.getMinutes()) {
        channel.send(
          `${user ? member.tag : member.user.tag} (${member}) was kicked or banned from the server.`
        ).catch(err => { });
      } else {
        channel.send(
          `We're sorry to see you leaving, ${user ? member.tag : member.user.tag}! (${member}) <:WubbzySad:608139268413587477>`
        ).catch(err => { });
      }
    } else {
      channel.send(
        `We're sorry to see you leaving, ${user ? member.tag : member.user.tag}! (${member}) <:WubbzySad:608139268413587477>`
      ).catch(err => { });
    }
  } else {
    channel.send(
      `We're sorry to see you leaving, ${user ? member.tag : member.user.tag}! (${member}) <:WubbzySad:608139268413587477>`
    ).catch(err => { });
  }
}
*/