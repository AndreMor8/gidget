import MessageModel from '../../database/models/muterole.js';
import MessageModel2 from '../../database/models/mutedmembers.js';
import Command from '../../utils/command.js';

export default class extends Command {
  constructor(options) {
    super(options);
    this.aliases = [];
    this.description = "Unrestrict members";
    this.guildonly = true;
    this.permissions = {
      user: [4, 0],
      bot: [268435456, 0]
    };
  }

  async run(message, args) {
    if (!args[1]) return message.channel.send('Please mention the user or enter their ID.')
    let member = message.mentions.members.first() || message.guild.members.cache.get(args[1]) || (args[1] ? await message.guild.members.fetch(args[1]).catch(err => { }) : undefined)
    if (!member) return message.channel.send('Invalid member!')
    let removeMemberRole = async (muteroleid, member, args) => {
      let role = message.guild.roles.cache.get(muteroleid)
      if (role && member) {
        if (args[2]) {
          member.roles.remove(role, 'Unrestrict command' + args.slice(2).join(" "))
            .then(async m => {
              let msg = await MessageModel2.findOne({ guildId: message.guild.id, memberId: member.id });
              if (msg) {
                msg.deleteOne();
              }
           await message.channel.send(`I've unrestricted ${member.user.tag} with reason: ${args.slice(2).join(" ")}`)
            })
            .catch(err => message.channel.send(`I couldn't unrestrict that user. Here's a debug: ` + err));
        } else {
          member.roles.remove(role, 'Unrestrict command')
            .then(async m => {
              let msg = await MessageModel2.findOne({ guildId: message.guild.id, memberId: member.id });
              if (msg) {
                msg.deleteOne();
              }
           await message.channel.send(`I've unrestricted ${member.user.tag}`)
            })
            .catch(err => message.channel.send(`I couldn't unrestrict that user. Here's a debug: ` + err));
        }
      } else {
     await message.channel.send('Something happened.')
      }
    }
    let MsgDocument = await MessageModel
      .findOne({ guildid: message.guild.id })
      .catch(err => console.log(err));
    if (MsgDocument) {
      var { muteroleid } = MsgDocument;
      removeMemberRole(muteroleid, member, args)
    } else {
      return message.channel.send('You must first register a role for unrestrict')
    }
  }
}