const Discord = require("discord.js");
const moment = require("moment");
require("moment-duration-format")
module.exports = {
    run: async (bot = new Discord.Client(), message = new Discord.Message(), args = []) => {
        let number = !isNaN(args[2]) ? parseInt(args[2]) : 0;
        let user = message.mentions.users.first() || bot.users.cache.get(args[1]) || bot.users.cache.find(e => e.username === (!isNaN(args[2]) ? args[1] : args.slice(1).join(" "))) || bot.users.cache.find(e => e.tag === (!isNaN(args[2]) ? args[1] : args.slice(1).join(" "))) || (message.guild ? (message.guild.members.cache.find(e => e.displayName === (!isNaN(args[2]) ? args[1] : args.slice(1).join(" "))) ? message.guild.members.cache.find(e => e.displayName === (!isNaN(args[2]) ? args[1] : args.slice(1).join(" "))).user : undefined) : undefined)
        if (!user) return message.channel.send("That user is not cached or may not have contact with him.");
        const presence = user.presence.activities[number];
        if (!user.presence.activities.length) return message.channel.send("There are no activities in that user");
        if (!presence) return message.channel.send("I can't find anything.");
        const embed = new Discord.MessageEmbed()
            .setTitle("Advanced information for " + user.username + "'s presence")
            .setTimestamp()
            .setColor("RANDOM")
            .addField("Name", presence.name, true)
            .addField("Created At", bot.intl.format(presence.createdAt), true)
            .addField("Type", presence.type, true);
        if (presence.applicationID) {
            embed.addField("Application ID", presence.applicationID, true)
        }
        if (presence.details) {
            embed.addField("Details", presence.details, true)
        }
        if (presence.emoji) {
            embed.addField("Emoji", presence.emoji.toString() + " ([URL](" + presence.emoji.url + "))", true)
        }
        if (presence.flags && presence.flags.toArray && presence.flags.toArray()[0]) {
            embed.addField("Flags", presence.flags.toArray().join("\n"), true)
        }
        if (presence.party) {
            if (presence.party.id) {
                embed.addField("Party ID", presence.party.id, true)
            }
            if (presence.party.size) {
                embed.addField("Party size", presence.party.size.join("/"))
            }
        }
        if (presence.state) {
            embed.addField("State", presence.state, true)
        }
        if (presence.timestamps) {
            if (presence.timestamps.start) {
                embed.addField("Start", moment.format(Date.now() - presence.timestamps.start.getTime()), true)
            }
            if (presence.timestamps.end) {
                embed.addField("End", moment.format(Date.now() - presence.timestamps.end.getTime()), true)
            }
        }
        if (presence.url) {
            embed.addField("URL", presence.url, true)
        }
        if (presence.assets) {
            if (presence.assets.largeText) {
                embed.addField("Asset large text", presence.assets.largeText)
            }
            if (presence.assets.smallText) {
                embed.addField("Asset small text", presence.assets.smallText)
            }
            if (presence.assets.largeImage) {
                embed.setImage(presence.assets.largeImageURL({ format: "png" }))
            }
            if (presence.assets.smallImage) {
                embed.setThumbnail(presence.assets.smallImageURL({ format: "png" }))
            }
        }
        message.channel.send(embed);

    },
    aliases: [],
    description: "View advanced user presence information."
}