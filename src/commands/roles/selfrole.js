import Discord from 'discord.js';

import MessageModel from '../../database/models/selfrole.js';

export default class extends Command {
  constructor(options) {
    super(options);
    this.description = "Add or remove roles from yourself";
    this.guildonly = true;
    this.permissions = {
      user: [0n, 0n],
      bot: [268435456n, 0n]
    };
  }
  async run(bot, message, args) {
    if (!args[1]) return message.channel.send('You haven\'t said anything. The options are `join`, `leave`, `list`. For interact with the database: `add`, `remove`')
    if (args[1] === 'list') {
      const msgDocument = await MessageModel.find({ guildid: message.guild.id }, "word");
      if (typeof msgDocument[0] !== "undefined" && msgDocument[0] !== null) {
        let text = "";
        let i = 1;
        for (const selfroles of Object.values(msgDocument)) {
          text += i + ". " + selfroles.word + '\n';
          i = i + 1;
        }
        const embed = new Discord.MessageEmbed()
          .setTitle("Selfroles for " + message.guild.name)
          .setDescription(text)
          .setTimestamp()
          .setColor("RANDOM");
        await message.channel.send({embeds: [embed]});
      } else {
        return message.channel.send("This server has no selfroles assigned.");
      }
    }
    if (!message.guild.me.permissions.has("MANAGE_ROLES")) return message.channel.send("First give me the permissions to manage roles, okay?");
    if (args[1] === 'add') {
      if (!message.member.permissions.has("ADMINISTRATOR")) return message.reply(`you do not have permission to execute this command.`)
      if (!args[2]) {
        return message.channel.send('Put a name for that selfrole')
      } else {
        let role = args[args.length - 1];
        if (role.charAt(0) == '-') {
          role = role.substring(1);
          args.pop();
        } else {
          return message.channel.send('You must put the role. Make a small dash (-) in the end of the message and mention the role or put the ID.')
        }
        const roleobj = message.mentions.roles.first() || message.guild.roles.cache.get(role)
        if (!roleobj) {
          return message.channel.send('That role isn\'t valid. Mention the role or put the role ID.')
        } else {
          const findMsgDocument = await MessageModel
            .findOne({ guildid: message.guild.id, word: args.slice(2).join(" ") })
            .catch(err => console.log(err));
          if (findMsgDocument) {
            return message.channel.send("That name already exists...");
          } else {
            const dbMsgModel = new MessageModel({
              guildid: message.guild.id,
              word: args.slice(2).join(" "),
              roleid: roleobj.id,
            });
            await dbMsgModel.save()
              .then(() => message.channel.send('Self role added correctly.'))
              .catch(err => message.channel.send('Something bad happened. Here\'s a debug: ' + err));
          }
        }

      }
    }
    if (args[1] === 'join') {
      if (!args[2]) return message.channel.send('Put a selfrole name.')
      const name = args.slice(2).join(" ");
      const msgDocument = await MessageModel.findOne({ guildid: message.guild.id, word: name });
      const addMemberRole = async (roleid) => {
        const role = message.guild.roles.cache.get(roleid)
        const member = message.member;
        if (role && member) {
          await member.roles.add(role).then(() => message.channel.send('I gave you the role correctly.')).catch(err => message.channel.send(`I can't give you the role. Here's a debug: ` + err));
        } else {
          await message.channel.send('Something happened. That role still exists?')
        }
      }
      if (!msgDocument) {
        return message.channel.send('That selfrole doesn\'t exist.');
      } else {
        const { roleid } = msgDocument;
        await addMemberRole(roleid, 'Selfrole command')
      }
    }
    if (args[1] === 'leave') {
      if (!args[2]) return message.channel.send('Put a selfrole name.')
      const name = args.slice(2).join(" ");
      const msgDocument = await MessageModel.findOne({ guildid: message.guild.id, word: name });
      const removeMemberRole = async (roleid) => {
        const role = message.guild.roles.cache.get(roleid)
        const member = message.member;
        if (role && member) {
          member.roles.remove(role).then(() => message.channel.send('I removed your role correctly.')).catch(err => message.channel.send(`I can't remove your role. Here's a debug: ` + err));
        } else {
          await message.channel.send('Something happened. That role still exists?')
        }
      }
      if (!msgDocument) {
        return message.channel.send('That selfrole doesn\'t exist.');
      } else {
        const { roleid } = msgDocument;
        await removeMemberRole(roleid, 'Selfrole command')
      }
    }
    if (args[1] === 'remove') {
      if (!message.member.permissions.has("ADMINISTRATOR")) return message.reply(`you do not have permission to execute this command.`)
      if (!args[2]) return message.channel.send('Tell me that selfrole should be removed from my database.')
      const name = args.slice(2).join(" ");
      const msgDocument = await MessageModel.findOne({ guildid: message.guild.id, word: name });
      if (msgDocument) {
        await msgDocument.remove().then(() => message.channel.send('I\'ve removed that selfrole from my database.')).catch(err => message.channel.send('I was unable to remove that selfrole from my database. Here\'s a debug: ' + err));
      } else {
        return message.channel.send('That selfrole doesn\'t exist.');
      }
    }
  }
}