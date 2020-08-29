const Discord = require("discord.js");

module.exports = {
    aliases: [],
    permissions: {
        user: [0, 0],
        bot: [0, 0]
    },
    description: "See a deleted message from a channel",
    run: async (bot, message, args) => {
        const channel = message.mentions.channels.filter(e => e.guild.id === message.guild.id).first() || message.guild.channels.cache.filter(e => ["news", "text"].includes(e.type)).get(args[1]) || message.guild.channels.cache.filter(e => ["news", "text"].includes(e.type)).find(e => e.name === args.slice(1).join(" ")) || message.guild.channels.cache.filter(e => ["news", "text"].includes(e.type)).find(e => e.position == args[1]) || message.channel;
        if(!channel.snipe) return message.channel.send("There are no snipes");
        else {
            const embed = new Discord.MessageEmbed()
            .setTitle("Snipe")
            .setColor("RANDOM")
            .setAuthor(channel.snipe.author.tag, channel.snipe.author.displayAvatarURL({ dynamic: true, format: "png" }))
            .addField("Content", channel.snipe.content || "Without content")
            .addField("Embeds", channel.snipe.embeds.length.toString())
            .addField("Attachments", channel.snipe.attachments.size.toString())
            .addField("Reactions", channel.snipe.reactions.cache.size.toString())
            message.channel.send(embed);
        }
    }
}