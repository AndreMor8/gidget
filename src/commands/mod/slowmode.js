const Discord = require('discord.js');

module.exports = {
  run: async (bot, message, args) => {
    if (!args[1]) {
      return message.channel.send('Usage: <:Gidget:610310249580331033>`slowmode <seconds> <channel>`')
    } else {
      var number = parseInt(args[1])
      if (number > 21600 || number < 0) {
        return message.channel.send('Invalid number. The number must be between 0 and 21600 seconds.')
      }
    }
    if (!args[2]) {
      var channel = message.guild.channels.cache.get(message.channel.id)
    } else {
      var channel = message.guild.channels.cache.get(args[2]) || message.mentions.channels.first();
    }
    if (channel) {
      channel.edit({ rateLimitPerUser: number }, "Slowmode command").then(() => { message.channel.send('Slowmode changed to ' + number + ' seconds in ' + message.channel.toString()) }).catch(err => message.reply(`I couldn't change the slowmode. Here's a debug: ` + err));
    } else {
      message.reply('that\'s not a valid channel')
    }
  },
  aliases: [],
  description: "Edit the channel slowmode",
  guildonly: true,
  permissions: {
    user: [268435456, 0],
    bot: [0, 16]
  }
}