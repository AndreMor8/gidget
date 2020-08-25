let thing = new Map();
module.exports = {
    run: async (bot, message, args) => {
        if(bot.voice.connections.size) {
            if(!thing.get(message.author.id)) {
                thing.set(message.author.id, true)
                setTimeout(() => {
                    thing.delete(message.author.id);
                }, 15000);
                return message.channel.send("There are users using the music function! If you do the command again the music will stop on them!");
            }
        }
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