
import MessageModel from "../../database/models/warn2.js";

export default class extends Command {
  constructor(options) {
    super(options);
    this.aliases = [];
    this.guildonly = true;
    this.description = "Remove the warning from a member.";
    this.permissions = {
      user: [4, 0],
      bot: [0, 0]
    };
  }
  async run(bot, message, args) {
    if (!args[1])
      return message.channel.send(
        "You must mention a member or write their ID."
      );
    const member = message.mentions.members.first() || message.guild.members.cache.get(args[1]) || (args[1] ? await message.guild.members.fetch(args[1]).catch(() => { }) : undefined)
    if (!member) return message.channel.send('Invalid member');
    const msgDocument = await MessageModel.findOne({ guildid: message.guild.id, memberid: args[1] }).catch(err => console.log(err));
    if (!msgDocument) return message.channel.send('I don\'t have that member registered.')
    try {
      const { warnings } = msgDocument;
      const newWarnings = warnings - 1;
      if (newWarnings < 0) {
        await message.channel.send('This member has no warnings.')
      } else {
        if (args[2]) {
          await msgDocument.update({ warnings: newWarnings });
          await member.send('You\'ve been pardoned on ' + message.guild.name + ' with reason: ' + args.slice(2).join(" ") + '. Now you have ' + newWarnings + ' warning(s).').catch(() => { });
          await message.channel.send(`${member.user.tag} has been pardoned with reason: ${args.slice(2).join(" ")}. Now they have ${newWarnings} warning(s).`)
        } else {
          await msgDocument.update({ warnings: newWarnings });
          await member.send('You\'ve been pardoned on ' + message.guild.name + '. Now you have ' + newWarnings + ' warning(s).').catch(() => { });
          await message.channel.send(`${member.user.tag} has been pardoned. Now they have ${newWarnings} warning(s).`)
        }
      }
    } catch (err) {
      return message.channel.send('I couldn\'t pardon the user correctly. Here\'s a debug: ' + err)
    }
  }
}

