const Discord = require('discord.js');
const MessageModel = require("../../database/models/prefix");
const fs = require('fs');

module.exports = {
  run: async (bot, message, args) => {
    if (!message.guild) return message.channel.send('This command only works on servers.')
    if (!args[1]) return message.channel.send('The actual prefix is ' + message.guild.cache.prefix ? message.guild.prefix : await message.guild.getPrefix());
    if (!message.member.hasPermission("ADMINISTRATOR")) return message.reply(`You do not have permission to execute this command.`)
    if (args[2]) return message.channel.send('I\'m not compatible with spaces, sorry.')

    const thing = await message.guild.setPrefix(args[1]);
    message.channel.send("Now the new server prefix is " + thing);

  },
  aliases: [],
  description: "Change the prefix of the server",
}