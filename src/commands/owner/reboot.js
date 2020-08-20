const Discord = require('discord.js');

module.exports = {
    run: async (bot, message, args) => {
        await message.channel.send('I\'m rebooting. Check the log to see if I\'m active.');
        process.exit(0);
    },
    aliases: ['restart'],
    secret: true,
    description: 'Reboot the bot to update files',
    dev: true,
    permissions: {
        user: [0, 0],
        bot: [0, 0]
    }
}