const cachedMessageReactions = new Map();
const MessageModel = require('../../database/models/message');

module.exports = async (bot, reaction, user) => {
  if(user.bot) return;
  if (!reaction.message.guild) return;
  
    let removeMemberRole = async (emojiRoleMappings) => {
        if (emojiRoleMappings.hasOwnProperty(reaction.emoji.id || reaction.emoji.name)) {
            let roleId = emojiRoleMappings[reaction.emoji.id || reaction.emoji.name];
            let role = reaction.message.guild.roles.cache.get(roleId);
            let member = reaction.message.guild.members.cache.get(user.id) || await reaction.message.guild.members.fetch(user.id).catch(err => {});
            if (role && member) {
              if(!member.guild.me.hasPermission("MANAGE_ROLES")) return member.send("I don't have permissions, sorry :(\nContact your server administrator.")
                member.roles.remove(role, 'Reaction-role');
            }
        }
    }

    await reaction.message.fetch();
    let id = reaction.message.id;
    let cach = bot.cachedMessageReactions.get(id);
  if(typeof cach === "boolean") return
  else if(!cach) {
   try {
    let msgDocument = await MessageModel.findOne({ messageId: id });
    if (msgDocument) {
      bot.cachedMessageReactions.set(id, msgDocument);
      var { emojiRoleMappings } = msgDocument;
      removeMemberRole(emojiRoleMappings);
    } else {
      bot.cachedMessageReactions.set(id, false);
    }
  } catch (err) {
    console.log(err);
  } 
  } else {
    var { emojiRoleMappings } = cach;
    removeMemberRole(emojiRoleMappings);
  }
};