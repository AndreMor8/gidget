const Discord = require('discord.js');

const MessageModel = require('../../database/models/muterole.js')

const MessageModel2 = require('../../database/models/mutedmembers.js');

module.exports = {
  run: async (bot, message, args) => {
    if (message.channel.type === 'dm') return message.channel.send('This command only works in servers')
    if (!message.member.hasPermission("BAN_MEMBERS")) return message.reply(`you do not have permission to execute this command.`)
    if (!args[1]) return message.channel.send('Please mention the user or enter their ID.')
      let member = message.mentions.members.first() || message.guild.members.cache.get(args[1]) || (args[1] ? await message.guild.members.fetch(args[1]).catch(err => {}) : undefined)
      if (!member) return message.channel.send('Invalid member!')
      let removeMemberRole = async (muteroleid, member, args) => {
        let role = message.guild.roles.cache.get(muteroleid)
        if (role && member) {
          if (args[2]) {
            member.roles.remove(role, 'Unrestrict command' + args.slice(2).join(" "))
              .then(async m => {
              let msg = await MessageModel2.findOne( {guildId: message.guild.id, memberId: member.id } );
              if (msg) {
                msg.deleteOne();
              }
              message.channel.send(`I've unrestricted ${member.user.tag} with reason: ${args.slice(2).join(" ")}`)
            })
              .catch(err => message.channel.send(`I couldn't unrestrict that user. Here's a debug: ` + err));
          } else {
            member.roles.remove(role, 'Unrestrict command')
              .then(async m => {
               let msg = await MessageModel2.findOne( {guildId: message.guild.id, memberId: member.id } );
              if (msg) {
                msg.deleteOne();
              }
              message.channel.send(`I've unrestricted ${member.user.tag}`)
            })
              .catch(err => message.channel.send(`I couldn't unrestrict that user. Here's a debug: ` + err));
          }
        } else {
          message.channel.send('Something happened.')
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
    },
    aliases: [],
    description: "Unrestrict members",
}