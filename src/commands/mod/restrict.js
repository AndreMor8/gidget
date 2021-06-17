//NEEDS REWRITE!
import MessageModel from '../../database/models/muterole.js';

export default class extends Command {
  constructor(options) {
    super(options)
    this.aliases = [];
    this.description = "Restrict members";
    this.guildonly = true;
    this.permissions = {
      user: [4n, 0n],
      bot: [268435456n, 0n]
    }
  }
  async run(bot, message, args) {
    if (!args[1]) return message.channel.send('Usage: `restrict <member> [reason]` or `restrict role <role>`')
    if (args[1] === 'role') {
      if (!message.member.permissions.has("ADMINISTRATOR")) return message.reply(`you do not have permission to execute this command.`)
      if (!args[2]) return message.channel.send('Please mention the role or enter the role ID.')
      const roleobj = message.mentions.roles.first() || message.guild.roles.cache.get(args[2]);
      if (!roleobj) return message.channel.send('That role isn\'t valid.')
      const MsgDocument = await MessageModel
        .findOne({ guildid: message.guild.id })
        .catch(err => console.log(err));
      if (MsgDocument) {
        try {
          await MsgDocument.updateOne({ muteroleid: roleobj.id });
          await message.channel.send('I\'ve updated the role from my database.')
        } catch (err) {
          return message.channel.send('I was unable to update the role in my database. Here\'s a debug: ' + err);
        }
      } else {
        const dbMsgModel = new MessageModel({
          guildid: message.guild.id,
          muteroleid: roleobj.id,
        });
        await dbMsgModel.save()
          .then(() => message.channel.send('I\'ve successfully registered the role'))
          .catch(err => message.channel.send('I was unable to register the role. Here\'s a debug: ' + err));
      }
    } else {
      if (!args[1]) return message.channel.send('Please mention the user or enter their ID.')
      const member = message.mentions.members.first() || message.guild.members.cache.get(args[1]) || (args[1] ? await message.guild.members.fetch(args[1]).catch(() => { }) : undefined)
      if (!member) return message.channel.send('Invalid member!')
      const addMemberRole = async (muteroleid, member, args) => {
        const role = message.guild.roles.cache.get(muteroleid)
        if (role && member) {
          if (args[2]) {
            if (member.guild.id === "402555684849451028") member.roles.remove(["669767097512886285", "599424187227963403", "608624771382378507", "689821345714143251", "674162651265499136"]);
            member.roles.add(role, 'Restrict command' + args.slice(2).join(" "))
              .then(message.channel.send(`I've restricted ${member.user.tag} with reason: ${args.slice(2).join(" ")}`))
              .catch(err => message.channel.send(`I couldn't restrict that user. Here's a debug: ` + err));
          } else {
            member.roles.add(role, 'Restrict command')
              .then(message.channel.send(`I've restricted ${member.user.tag}`))
              .catch(err => message.channel.send(`I couldn't restrict that user. Here's a debug: ` + err));
          }
        } else {
          await message.channel.send('Something happened.')
        }
      }
      const MsgDocument = await MessageModel
        .findOne({ guildid: message.guild.id })
        .catch(err => console.log(err));
      if (MsgDocument) {
        const { muteroleid } = MsgDocument;
        await addMemberRole(muteroleid, member, args)
      } else {
        return message.channel.send('You must first register a role for restrict')
      }
    }
  }
}