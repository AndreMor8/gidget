import MessageModel from "../../database/models/warn2.js";
import Command from "../../utils/command.js";
export default class extends Command {
  constructor(options) {
    super(options)
    this.aliases = ["nw"];
    this.description = "It shows the warnings that the user has, by DMs.";
    this.guildonly = true;
  }
  async run(bot, message, args) {
    if (!message.guild)
      return message.channel.send("This command only works on servers.");
    if (args[1]) {
      if (!message.member.hasPermission("BAN_MEMBERS")) {
        return message.channel.send(
          "You can't see how many warnings someone else has."
        );
      }
    }
    let member =
      message.mentions.members.first() ||
      message.guild.members.cache.get(args[1]) ||
      message.member;
    let document = await MessageModel.findOne({
      guildid: message.guild.id,
      memberid: member.id
    }).catch(err => console.log(err));
    if (document) {
      if (!args[1]) {
        let { warnings } = document;
        if (warnings < 1) {
          member
            .send("You don't have any warning.")
            .then(m => message.channel.send("I have sent that information to your DM.")
            )
            .catch(err => message.channel.send("Make sure your DMs are open!"));
        } else {
          member
            .send(
              `You have ${warnings} warnings. Contact an admin to find out how to be pardoned.`
            )
            .then(m => message.channel.send("I have sent that information to your DM.")
            )
            .catch(err => message.channel.send("Make sure your DMs are open!"));
        }
      } else {
        let { warnings } = document;
        if (warnings < 1) {
       await message.channel.send(`${member.user.tag} has no warnings`);
        } else {
       await message.channel.send(`${member.user.tag} has ${warnings} warnings`);
        }
      }
    } else {
      if (!args[1]) {
        member
          .send("You don't have any warning.")
          .then(m => message.channel.send("I have sent that information to your DM.")
          )
          .catch(err => message.channel.send("Make sure your DMs are open!"));
      } else {
     await message.channel.send(`${member.user.tag} has no warnings`);
      }
    }
  }
}