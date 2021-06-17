import MessageModel from '../../database/models/message.js';

export default async (bot, reaction, user) => {
  if (user.bot) return;
  if (!reaction.message.guild) return;

  const removeMemberRole = async (emojiRoleMappings) => {
    if (Object.prototype.hasOwnProperty.call(emojiRoleMappings, reaction.emoji.id || reaction.emoji.name)) {
      const roleId = emojiRoleMappings[reaction.emoji.id || reaction.emoji.name];
      const role = reaction.message.guild.roles.cache.get(roleId);
      const member = reaction.message.guild.members.cache.get(user.id) || await reaction.message.guild.members.fetch(user.id).catch(() => { });
      if (role && member) {
        if (!member.guild.me.permissions.has("MANAGE_ROLES")) return member.send("I don't have permissions, sorry :(\nContact your server administrator.")
        member.roles.remove(role, 'Reaction-role');
      }
    }
  }

  await reaction.message.fetch();
  const cach = bot.cachedMessageReactions.get(reaction.message.id);
  if (typeof cach === "boolean") return
  else if (!cach) {
    try {
      const msgDocument = await MessageModel.findOne({ messageId: reaction.message.id });
      if (msgDocument) {
        bot.cachedMessageReactions.set(reaction.message.id, msgDocument);
        const { emojiRoleMappings } = msgDocument;
        removeMemberRole(emojiRoleMappings);
      } else {
        bot.cachedMessageReactions.set(reaction.message.id, false);
      }
    } catch (err) {
      console.log(err);
    }
  } else {
    const { emojiRoleMappings } = cach;
    removeMemberRole(emojiRoleMappings);
  }
};