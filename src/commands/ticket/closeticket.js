const MessageModel = require("../../database/models/tmembers");
const MessageModel2 = require("../../database/models/ticket");

module.exports = {
  run: async (bot, message, args) => {
    let msgDocument2 = await MessageModel.findOne({ guildId: message.guild.id, channelId: message.channel.id })
    if(!msgDocument2) return message.channel.send("This isn't a ticket-type chat!")
    let { from } = msgDocument2;
    let msgDocument = await MessageModel2.findOne({ guildId: message.guild.id, messageId: from });
     if(!msgDocument) return message.channel.send("There is no ticket system here.")
    let finish = async (staff = false) => {
        try {
          let { memberId, channelId } = msgDocument2;
          let channel = message.guild.channels.cache.get(channelId);
          let member = message.guild.members.cache.get(memberId);
          if (channel) {
           await channel.delete("Finished ticket!");
          }
          if (member) {
            await member.send(staff ? args[1] ? "Your ticket was closed by " + message.author.tag + " with reason: " + args.slice(1).join(" ") : "Your ticket was closed by " + message.author.tag : 'You have successfully closed your ticket.').catch(err => {});
          }
          await msgDocument2.deleteOne()
        } catch (err){
          console.log(err);
        }
    }
    let { manual, roles, perms } = msgDocument;
    let s = 0;
    if (message.member.hasPermission(perms)) {
      finish(true);
    } else {
      for (let i in roles) {
        if(message.member.roles.cache.has(roles[i])) {
        s++;
        break;
        }
      }
      if(s === 0) {
        if(manual) {
          let { memberId } = msgDocument2;
          if(memberId === message.member.id) {
            finish();
          } else message.channel.send("You do not have sufficient permissions to close a ticket.");
        }
        else message.channel.send("You do not have sufficient permissions to close a ticket.");
      } else {
        finish(true);
      }
    }
    

  },
  aliases: [],
  description: "Close a user ticket",
  guildonly: true,
  permissions: {
    user: [0, 0],
    bot: [0, 16]
  }
};