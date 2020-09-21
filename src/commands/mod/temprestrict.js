import Command from '../../utils/command.js'
import ms from "ms";
import tempmute from '../../utils/tempmute.js';
import MessageModel from '../../database/models/muterole.js'
import MessageModel2 from '../../database/models/mutedmembers.js';

export default class extends Command {
  constructor(options) {
    super(options);
    this.aliases = ["tempr", "tr", "trestrict"];
    this.description = "Restrict members";
    this.guildonly = true;
    this.permissions = {
      user: [4, 0],
      bot: [268435456, 0]
    }
  }
  async run(message, args) {
    if (!args[1]) return message.channel.send('Usage: `temprestrict <time> <member> <reason>`');
    let time = ms(args[1]);
    if (typeof time !== "number") return message.channel.send('Invalid time!');
    let member = message.mentions.members.first() || message.guild.members.cache.get(args[2]) || message.guild.members.cache.find(m => m.displayName === args[2]) || message.guild.members.cache.find(m => m.user.username === args[2]) || (args[2] ? await message.guild.members.fetch(args[2]).catch(err => { }) : undefined)
    if (!member) return message.channel.send('Invalid member!');
    let addMemberRole = async (muteroleid, member, time, args) => {
      let MsgDocument = await MessageModel2.findOne({ guildid: message.guild.id, memberId: member.id }).catch(err => console.log(err));
      if (MsgDocument) return message.channel.send("That member is already restricted.");
      const newData = new MessageModel2({
        guildId: message.guild.id,
        memberId: member.id,
        date: new Date(new Date().getTime() + time),
      });
      newData.save().then(() => {
        let role = message.guild.roles.cache.get(muteroleid)
        if (role && member) {
          if (args[3]) {
            member.roles.add(role, 'Restrict command - ' + args.slice(3).join(" "))
              .then(m => {
                message.channel.send(`I've restricted ${member.user.tag} for ${ms(time)} with reason: ${args.slice(3).join(" ")}`);
                tempmute(true);
              }).catch(err => message.channel.send(`I couldn't restrict that user. Here's a debug: ` + err));
          } else {
            member.roles.add(role, 'Restrict command')
              .then(m => {
                message.channel.send(`I've restricted ${member.user.tag} for ${ms(time)}`);
                tempmute(true);
              }).catch(err => message.channel.send(`I couldn't restrict that user. Here's a debug: ` + err));
          }
        } else {
          message.channel.send('Something happened.')
        }
      }).catch(err => message.channel.send('I have not been able to correctly save the information in my database. Here\'s a debug: ' + err))
    }
    let msgDocument = await MessageModel.findOne({ guildid: message.guild.id }).catch(err => console.log(err));
    if (msgDocument) {
      let { muteroleid } = msgDocument;
      addMemberRole(muteroleid, member, time, args);
    } else {
      return message.channel.send('You must first register a role for restrict. Use `restrict role` for set a role');
    }
  }
}