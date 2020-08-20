const { MessageEmbed } = require("discord.js")

module.exports = {
    run: async (bot, message, args) => {
        let servers = bot.guilds.cache.size
        let users = bot.users.cache.size

        let serverEmbed = new MessageEmbed()
            .setDescription("At the moment I'm in **" + servers + "** servers and with **" + users + "** online users.", true)
            .setColor(0xf7a7ff)
            .setFooter('Requested by ' + message.author.username, message.author.displayAvatarURL());

        message.channel.send(serverEmbed)
    },
    aliases: [],
    description: "Server and user count",
    permissions: {
        user: [0, 0],
        bot: [0, 16384]
      }
}