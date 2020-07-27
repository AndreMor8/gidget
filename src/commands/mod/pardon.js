const Discord = require('discord.js');

const MessageModel = require("../../database/models/warn2");

module.exports = {
    run: async (bot, message, args) => {
      if (message.channel.type === "dm")
      return message.channel.send("This command only works on servers.");
    if (!message.member.hasPermission("BAN_MEMBERS"))
      return message.reply(
        `You do not have permission to execute this command.`
      );
      if (!args[1])
      return message.channel.send(
        "You must mention a member or write their ID."
      );
      const member = message.mentions.members.first() || message.guild.members.cache.get(args[1]) || (args[1] ? await message.guild.members.fetch(args[1]).catch(err => {}) : undefined)
      if (!member) return message.channel.send('Invalid member');
      let msgDocument = await MessageModel.findOne({ guildid: message.guild.id, memberid: args[1] }).catch(err => console.log(err));
      if (!msgDocument) return message.channel.send('I don\'t have that member registered.')
      try {
        let { warnings } = msgDocument;
        let newWarnings = warnings - 1;
        if (newWarnings < 0) {
           message.channel.send('This member has no warnings.')
        } else {
          if (args[2]) {
            let form = await msgDocument.update({ warnings: newWarnings });
            member.send('You\'ve been pardoned on ' + message.guild.name + ' with reason: ' + args.slice(2).join(" ") + '. Now you have ' + newWarnings + ' warning(s).')
            message.channel.send(`${member.user.tag} has been pardoned with reason: ${args.slice(2).join(" ")}. Now they have ${newWarnings} warning(s).`)
          } else {
            let form = await msgDocument.update({ warnings: newWarnings });
            member.send('You\'ve been pardoned on ' + message.guild.name + '. Now you have ' + newWarnings + ' warning(s).')
            message.channel.send(`${member.user.tag} has been pardoned. Now they have ${newWarnings} warning(s).`)
          }
        }
      } catch (err) {
        return message.channel.send('I couldn\'t pardon the user correctly. Here\'s a debug: ' + err)
      }
    },
    aliases: [],
    description: "Remove the warning from a member.",
}