const Discord = require("discord.js");
const moment = require("moment");
require("moment-duration-format");
module.exports = {
    run: async (bot, message, args) => {
        let number = !isNaN(args[args.length - 1]) && args[args.length - 1].length < 15 ? parseInt(args[args.length - 1]) : 0;
        if (!isNaN(args[args.length - 1]) && args.length > 1 && args[args.length - 1].length < 15) args.pop();
        let user = message.mentions.users.first() || bot.users.cache.get(args[1]) || bot.users.cache.find(e => e.username === args.slice(1).join(" ")) || bot.users.cache.find(e => e.tag === args.slice(1).join(" ")) || (message.guild ? (message.guild.members.cache.find(e => e.displayName === args.slice(1).join(" ")) ? message.guild.members.cache.find(e => e.displayName === args.slice(1).join(" ")).user : undefined) : undefined);
        if (!user) {
            user = message.author;
        }
        const presence = user.presence.activities[number];
        if (!user.presence.activities.length) return message.channel.send("There are no activities in that user");
        if (!presence) return message.channel.send("I can't find anything.");
        const embed = new Discord.MessageEmbed()
            .setTitle("Advanced information for " + user.username + "'s presence")
            .setTimestamp()
            .setColor("RANDOM")
            .addField("Name", presence.name, true)
            .addField("Type", presence.type, true);
            if(!isNaN(presence.createdTimestamp) && presence.createdAt) {
                embed.addField("Created At", bot.intl.format(presence.createdAt), true)
            }
        if (presence.applicationID) {
            embed.addField("Application ID", presence.applicationID, true)
        }
        if (presence.details) {
            embed.addField("Details", presence.details, true)
        }
        if (presence.emoji) {
            embed.addField("Emoji", presence.emoji.toString() + (emoji.id ? " [(URL)](" + presence.emoji.url + ")" : ""), true)
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
                embed.addField("Start", moment.duration(Date.now() - presence.timestamps.start.getTime()).format(), true)
            }
            if (presence.timestamps.end) {
                embed.addField("End", moment.duration(Date.now() - presence.timestamps.end.getTime()).format(), true)
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