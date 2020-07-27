const Discord = require('discord.js');
const MessageModel = require("../../database/models/prefix");
const fs = require('fs');

module.exports = {
    run: async (bot, message, args) => {
      if (!message.guild) return message.channel.send('This command only works on servers.')
      if(!message.member.hasPermission("ADMINISTRATOR")) return message.reply(`You do not have permission to execute this command.`)
      if(!args[1]) return message.channel.send('Tell me a prefix!')
      if(args[2]) return message.channel.send('I\'m not compatible with spaces, sorry.')

      const msgDocument = await MessageModel.findOne({ guildId: message.guild.id })
      if(msgDocument) {
        msgDocument.updateOne({ prefix: args[1] }).then(() => {
          bot.guildprefix.delete(message.guild.id);
          message.channel.send('I\'ve changed the prefix of this server to: ' + args[1])
        }).catch(err => message.channel.send("Some error ocurred! Here's a debug: " + err));
      } else {
        new MessageModel({
          guildId: message.guild.id,
          prefix: args[1]
        }).save().then(() => {
          bot.guildprefix.delete(message.guild.id);
          message.channel.send('I\'ve changed the prefix of this server to: ' + args[1])
        }).catch(err => message.channel.send("Some error ocurred! Here's a debug: " + err));
      }

    },
    aliases: [],
    description: "Change the prefix of the server",
}