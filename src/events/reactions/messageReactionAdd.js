const MessageModel = require("../../database/models/message");
const MessageModel2 = require("../../database/models/ticket");
const MessageModel3 = require("../../database/models/tmembers");

module.exports = async (bot, reaction, user) => {
  //Core
  if (user.bot) return;
  if (!reaction.message.guild) return;

  //Function for role-reaction
  let addMemberRole = async emojiRoleMappings => {
    if (emojiRoleMappings.hasOwnProperty(reaction.emoji.id)) {
      let roleId = emojiRoleMappings[reaction.emoji.id];
      let role = reaction.message.guild.roles.cache.get(roleId);
      let member = reaction.message.guild.members.cache.get(user.id) || await reaction.message.guild.members.fetch(user.id).catch(err => {});
      if (role && member) {
        if(!member.guild.me.hasPermission("MANAGE_ROLES")) return member.send("I don't have permissions, sorry :(\nContact your server administrator.")
        member.roles.add(role, "Reaction-role");
      }
    }
  };
  //Fetch
  await reaction.message.fetch();
  
  //I don't know why...
  let id = reaction.message.id;
  
  
  let msgDocument2 = await MessageModel2.findOne({
    guildId: reaction.message.guild.id,
    messageId: id,
    channelId: reaction.message.channel.id,
    emojiId: reaction.emoji.id ? reaction.emoji.id : reaction.emoji.name
  });
  if (msgDocument2) {
    await bot.users.fetch(user.id);
    if(reaction.message.channel.permissionsFor(bot.user.id).has("MANAGE_MESSAGES")) await reaction.users.remove(user);
    let msgDocument3 = await MessageModel3.findOne({
      guildId: reaction.message.guild.id,
      from: reaction.message.id,
      memberId: user.id
    });
    if (msgDocument3) return user.send("You already have a ticket!").catch(err => {});
    if(!reaction.message.guild.me.hasPermission("MANAGE_CHANNELS")) return user.send("I don't have permissions, sorry :(\nContact your server administrator.").catch(err => {})
    let { categoryId, roles } = msgDocument2;
    let cat = reaction.message.guild.channels.cache.get(categoryId);
    let roleperm = [
      {
        allow: ["VIEW_CHANNEL", "SEND_MESSAGES"],
        id: user.id
      },
      {
        deny: "VIEW_CHANNEL",
        id: reaction.message.guild.id
      },
      {
        allow: ["VIEW_CHANNEL", "SEND_MESSAGES"],
        id: bot.user.id
      }
    ];

    if (roles[0]) {
      for (let i in roles) {
        if (reaction.message.guild.roles.cache.get(roles[i])) {
          roleperm.push({
            allow: ["VIEW_CHANNEL", "SEND_MESSAGES"],
            id: roles[i]
          });
        }
      }
    }
    let todesc = msgDocument2.desc.replace(/%AUTHOR%/g, user.toString());
    reaction.message.guild.channels
      .create(`${user.username}s-ticket`, {
        type: "text",
        topic: todesc,
        permissionOverwrites: roleperm,
        parent: cat,
        reason: "User created a ticket!"
      })
      .then(ch => {
        let dbMsgModel = new MessageModel3({
          guildId: reaction.message.guild.id,
          channelId: ch.id,
          memberId: user.id,
          from: reaction.message.id
        });
        dbMsgModel.save().then(m => {
          if (msgDocument2.welcomemsg) {
            let tosend = msgDocument2.welcomemsg.replace(
              /%AUTHOR%/g,
              user.toString()
            );
            ch.send(tosend);
          }
        });
      });
  }
  
  
  //Main function
  
  let cach = bot.cachedMessageReactions.get(id);
  if(typeof cach === "boolean") return
  else if(!cach) {
   try {
    let msgDocument = await MessageModel.findOne({ messageId: id });
    if (msgDocument) {
      bot.cachedMessageReactions.set(id, msgDocument);
      var { emojiRoleMappings } = msgDocument;
      addMemberRole(emojiRoleMappings);
    } else {
      bot.cachedMessageReactions.set(id, false);
    }
  } catch (err) {
    console.log(err);
  } 
  } else {
    var { emojiRoleMappings } = cach;
    addMemberRole(emojiRoleMappings);
  }
};
