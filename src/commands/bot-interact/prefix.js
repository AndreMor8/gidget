const Discord = require('discord.js');
const MessageModel = require("../../database/models/prefix");
const fs = require('fs');

module.exports = {
  run: async (bot, message, args) => {
    if (!args[1]) return message.channel.send('The actual prefix is ' + (message.guild.cache.prefix ? message.guild.prefix : await message.guild.getPrefix()));
    if (args[2]) return message.channel.send('I\'m not compatible with spaces, sorry.')

    const thing = await message.guild.setPrefix(args[1]);
    message.channel.send("Now the new server prefix is " + thing);

  },
  aliases: [],
  description: "Change the prefix of the server",
  guildonly: true,
  permissions: {
    user: [8, 0],
    bot: [0, 0]
  }
}