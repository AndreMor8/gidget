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
        if(!channel.permissionsFor(bot.user).has("VIEW_CHANNEL")) return message.channel.send("I don't have permissions");
        if(!channel.permissionsFor(message.author).has("VIEW_CHANNEL")) return message.channel.send("You don't have permissions");
        if(!channel.snipe) return message.channel.send("There are no snipes");
        else {
            const attachmenttext = Discord.Util.splitMessage(channel.snipe.attachments.map(e => "1. " + e.url).join("\n"), { maxLength: 1000 })[0];
            const reactiontext = Discord.Util.splitMessage(channel.snipe.reactions.cache.map(e => e.emoji.toString() + " => " + e.users.cache.size).join(", "), { maxLength: 1000 })[0];
            const embed = new Discord.MessageEmbed()
            .setTitle("Snipe")
            .setColor("RANDOM")
            .setAuthor(channel.snipe.author.tag, channel.snipe.author.displayAvatarURL({ dynamic: true, format: "png" }))
            .addField("Content", channel.snipe.content || "*Without content...*")
            .addField("Embeds", channel.snipe.embeds.length.toString())
            .addField("Attachments", attachmenttext || "*Without attachments...*")
            .addField("Reactions", reactiontext || "*Without reactions...*")
            message.channel.send(embed);
        }
    }
}