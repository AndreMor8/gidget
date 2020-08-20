const Discord = require('discord.js');

module.exports = {
    run: async (bot, message, args) => {
        message.channel.send("Pong!")
            .then((msg) => {
                msg.edit("Ping: " + (Date.now() - msg.createdTimestamp) + 'ms\nPing from the API: '+ bot.ws.ping + 'ms')
            });
    },
    aliases: [],
    description: "Bot test",
    permissions: {
        user: [0, 0],
        bot: [0, 0]
      }
}