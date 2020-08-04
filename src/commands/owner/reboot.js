const Discord = require('discord.js');

module.exports = {
    run: async (bot, message, args) => {
        if (message.author.id === '577000793094488085') {
            await message.channel.send('I\'m rebooting. Check the log to see if I\'m active.');
            process.exit(0);
        } else {
            return message.channel.send('Only AndreMor can use this command.')
        }
    },
    aliases: ['restart'],
    secret: true,
    description: 'Reboot the bot to update files',
}