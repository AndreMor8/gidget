module.exports = {
    run: async (bot, message, args) => {
        let servers = client.guilds.cache.size
        let users = client.users.cache.size

        let serverEmbed = new Discord.MessageEmbed()
            .setDescription("At the moment I'm in **" + servers + "** servers and with **" + users + "** online users.", true)
            .setColor(0xf7a7ff)
            .setFooter('Requested by ' + message.author.username, message.author.displayAvatarURL());

        message.channel.send(serverEmbed)
    },
    aliases: [],
    description: "Server and user count"
}