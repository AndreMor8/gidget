import MessageModel from '../../database/models/muterole.js';
import MessageModel2 from '../../database/models/mutedmembers.js';
import tempmutesystem from '../../utils/tempmute.js';

export default class extends Command {
  constructor(options) {
    super(options);
    this.aliases = [];
    this.description = "Unrestrict members";
    this.guildonly = true;
    this.permissions = {
      user: [4n, 0n],
      bot: [268435456n, 0n]
    };
  }

  async run(bot, message, args) {
    if (!args[1]) return message.channel.send('Please mention the user or enter their ID.')
    const member = message.mentions.members.first() || message.guild.members.cache.get(args[1]) || (args[1] ? await message.guild.members.fetch(args[1]).catch(() => { }) : undefined)
    if (!member) return message.channel.send('Invalid member!')
    const removeMemberRole = async (muteroleid, member, args) => {
      const role = message.guild.roles.cache.get(muteroleid)
      if (role && member) {
        if (args[2]) {
          member.roles.remove(role, 'Unrestrict command' + args.slice(2).join(" "))
            .then(async () => {
              const msg = await MessageModel2.findOne({ guildId: message.guild.id, memberId: member.id });
              if (msg) {
                msg.deleteOne();
                tempmutesystem(bot, true);
              }
           await message.channel.send(`I've unrestricted ${member.user.tag} with reason: ${args.slice(2).join(" ")}`)
            })
            .catch(err => message.channel.send(`I couldn't unrestrict that user. Here's a debug: ` + err));
        } else {
          member.roles.remove(role, 'Unrestrict command')
            .then(async () => {
              const msg = await MessageModel2.findOne({ guildId: message.guild.id, memberId: member.id });
              if (msg) {
                msg.deleteOne();
                tempmutesystem(bot, true);
              }
           await message.channel.send(`I've unrestricted ${member.user.tag}`)
            })
            .catch(err => message.channel.send(`I couldn't unrestrict that user. Here's a debug: ` + err));
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
      removeMemberRole(muteroleid, member, args)
    } else {
      return message.channel.send('You must first register a role for unrestrict')
    }
  }
}