const Discord = require('discord.js');

module.exports = {
    run: async (bot, message, args) => {
        if(!args[1]) return message.reply('you must input text to be reversed!')
        message.channel.send(args.slice(1).join(' ').split('').reverse().join(''));
    },
    aliases: [],
    description: "Reverse some text",
    permissions: {
        user: [0, 0],
        bot: [0, 0]
    }
}
