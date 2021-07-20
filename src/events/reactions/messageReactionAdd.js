import MessageModel from "../../database/models/message.js";
import MessageModel2 from "../../database/models/ticket.js";
import MessageModel3 from "../../database/models/tmembers.js";

export default async (bot, reaction, user) => {
  //Core
  if (user.bot) return;
  if (!reaction.message.guild) return;

  //Function for role-reaction
  const addMemberRole = async emojiRoleMappings => {
    if (Object.prototype.hasOwnProperty.call(emojiRoleMappings, reaction.emoji.id || reaction.emoji.name)) {
      const roleId = emojiRoleMappings[reaction.emoji.id || reaction.emoji.name];
      const role = reaction.message.guild.roles.cache.get(roleId);
      const member = reaction.message.guild.members.cache.get(user.id) || await reaction.message.guild.members.fetch(user.id).catch(() => { });
      if (role && member) {
        if (!member.guild.me.permissions.has("MANAGE_ROLES")) return member.send("I don't have permissions, sorry :(\nContact your server administrator.")
        member.roles.add(role, "Reaction-role");
      }
    }
  };
  //Fetch
  await reaction.message.fetch().catch(() => { });

  const msgDocument2 = await MessageModel2.findOne({
    guildId: reaction.message.guild.id,
    messageId: reaction.message.id,
    channelId: reaction.message.channel.id,
    emojiId: reaction.emoji.id || reaction.emoji.name
  });

  if (msgDocument2) {
    await bot.users.fetch(user.id);
    if (reaction.message.channel.permissionsFor(bot.user.id).has("MANAGE_MESSAGES")) await reaction.users.remove(user);
    const msgDocument3 = await MessageModel3.findOne({
      guildId: reaction.message.guild.id,
      from: reaction.message.id,
      memberId: user.id
    });
    if (msgDocument3) return user.send("You already have a ticket!").catch(() => { });
    if (!reaction.message.guild.me.permissions.has("MANAGE_CHANNELS")) return user.send("I don't have permissions, sorry :(\nContact your server administrator.").catch(() => { })
    const { categoryId, roles } = msgDocument2;
    const cat = reaction.message.guild.channels.cache.get(categoryId) || await reaction.message.guild.channels.fetch(categoryId).catch(() => { });
    const roleperm = [
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
      for (const i in roles) {
        if (reaction.message.guild.roles.cache.get(roles[i])) {
          roleperm.push({
            allow: ["VIEW_CHANNEL", "SEND_MESSAGES"],
            id: roles[i]
          });
        }
      }
    }
    const todesc = msgDocument2.desc?.replace(/%AUTHOR%/g, user.toString());
    reaction.message.guild.channels
      .create(`${user.username}s-ticket`, {
        type: "text",
        topic: todesc,
        permissionOverwrites: roleperm,
        parent: cat,
        reason: "User created a ticket!"
      })
      .then(ch => {
        const dbMsgModel = new MessageModel3({
          guildId: reaction.message.guild.id,
          channelId: ch.id,
          memberId: user.id,
          from: reaction.message.id
        });
        dbMsgModel.save().then(() => {
          if (msgDocument2.welcomemsg) {
            const tosend = msgDocument2.welcomemsg.replace(
              /%AUTHOR%/g,
              user.toString()
            );
            ch.send({ content: tosend, allowedMentions: { parse: ['users', 'roles', 'everyone'] } });
          }
          ch.send("**WARNING:** This ticket was created using version 1 of Gidget. In version 2 this system has changed from reactions to buttons and requires the re-creation of the ticket system. Reaction tickets will stop working on August 1.\n\nPlease re-create your ticket system.");
        });
      });
  }


  //Main function

  const cach = bot.cachedMessageReactions.get(reaction.message.id);
  if (typeof cach === "boolean") return
  else if (!cach) {
    try {
      const msgDocument = await MessageModel.findOne({ messageId: reaction.message.id });
      if (msgDocument) {
        bot.cachedMessageReactions.set(reaction.message.id, msgDocument);
        const { emojiRoleMappings } = msgDocument;
        addMemberRole(emojiRoleMappings);
      } else {
        bot.cachedMessageReactions.set(reaction.message.id, false);
      }
    } catch (err) {
      console.log(err);
    }
  } else {
    const { emojiRoleMappings } = cach;
    addMemberRole(emojiRoleMappings);
  }
};
