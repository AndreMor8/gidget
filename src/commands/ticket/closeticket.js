
import MessageModel from "../../database/models/tmembers.js";
import MessageModel2 from "../../database/models/ticket.js";

export default class extends Command {
  constructor(options) {
    super(options);
    this.description = "Close a user ticket";
    this.guildonly = true;
    this.permissions = {
      user: [0, 0],
      bot: [0, 16]
    };
  }
  async run(bot, message, args) {
    const msgDocument2 = await MessageModel.findOne({ guildId: message.guild.id, channelId: message.channel.id })
    if (!msgDocument2) return message.channel.send("This isn't a ticket-type chat!")
    const { from } = msgDocument2;
    const msgDocument = await MessageModel2.findOne({ guildId: message.guild.id, messageId: from });
    if (!msgDocument) return message.channel.send("There is no ticket system here.")
    const finish = async (staff = false) => {
      try {
        const { memberId, channelId } = msgDocument2;
        const channel = message.guild.channels.cache.get(channelId);
        const member = message.guild.members.cache.get(memberId);
        if (channel) {
          await channel.delete("Finished ticket!");
        }
        if (member) {
          await member.send(staff ? args[1] ? "Your ticket was closed by " + message.author.tag + " with reason: " + args.slice(1).join(" ") : "Your ticket was closed by " + message.author.tag : 'You have successfully closed your ticket.').catch(() => { });
        }
        await msgDocument2.deleteOne()
      } catch (err) {
        console.log(err);
      }
    }
    const { manual, roles, perms } = msgDocument;
    let s = 0;
    if (message.member.hasPermission(perms)) {
      finish(true);
    } else {
      for (const i in roles) {
        if (message.member.roles.cache.has(roles[i])) {
          s++;
          break;
        }
      }
      if (s === 0) {
        if (manual) {
          const { memberId } = msgDocument2;
          if (memberId === message.member.id) {
            finish();
          } else message.channel.send("You do not have sufficient permissions to close a ticket.");
        }
        else message.channel.send("You do not have sufficient permissions to close a ticket.");
      } else {
        finish(true);
      }
    }


  }
}