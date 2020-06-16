const Discord = require('discord.js');

module.exports = {
    run: async (bot, message, args) => {
      if (message.author.id !== '577000793094488085') return message.channel.send('Only AndreMor can use this command.')
    },
    aliases: [],
    secret: true,
    description: 'Some console.log tests',
}