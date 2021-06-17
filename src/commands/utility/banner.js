import banner from '../../database/models/banner.js';
import fetch from 'node-fetch';
import { MessageEmbed, Util } from 'discord.js';
export default class extends Command {
    constructor(options) {
        super(options);
        this.description = "Rotate the banner of your server with different images that will be shown at the hours you choose (you can only choose hours, example, 16)";
        this.permissions = {
            user: [8n, 0n],
            bot: [32n, 0n]
        };
        this.guildonly = true;
    }
    async run(bot, message, args) {
        if (!args[1]) return message.channel.send("Usage: `banner <mode> [<args...>]`\nAvailable modes: `add`, `remove`, `enable`, `list`");
        if (args[1].toLowerCase() === "enable") {
            const doc = await banner.findOne({ guildID: message.guild.id });
            if (doc) {
                await doc.updateOne({ $set: { enabled: !doc.enabled } });
                await message.channel.send(`Banner rotating ${!doc.enabled ? "enabled" : "disabled"}!`);
            } else {
                await banner.create({ guildID: message.guild.id });
                await message.channel.send("Banner rotating enabled!");
            }
            return;
        } else if (args[1].toLowerCase() === "add") {
            if (isNaN(args[2])) return message.channel.send("Put a valid time between 0 and 23 (time zone in ET)");
            const hour = parseInt(args[2]);
            if (hour > 23 || hour < 0) return message.channel.send("Put a valid time between 0 and 23 (time zone in ET)");
            const url = args[3] || message.attachments.first()?.url;
            if (!/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()!@:%_+.~#?&//=]*)/.test(url)) return message.channel.send("Put a valid image URL, or upload a file next to the command.");
            const res = await fetch(url);
            if (!res.ok) return message.channel.send(`Status code returned ${res.status} (${res.statusText})`);
            const doc = await banner.findOne({ guildID: message.guild.id });
            if (!doc) await banner.create({ guildID: message.guild.id, banners: [{ url, hour }] });
            else {
                if (doc.banners.find(e => e.hour === hour)) return message.channel.send("Only 1 banner image per hour!");
                await doc.updateOne({ $push: { banners: { url, hour } } });
            }
            bot.doneBanners.delete(message.guild.id);
            return message.channel.send(`Ok, this image will be your banner each ${hour}:00 (ET)`);
        } else if (args[1].toLowerCase() === "remove") {
            if (isNaN(args[2])) return message.channel.send("Put a valid time between 0 and 23");
            const hour = parseInt(args[2]);
            if (hour > 23 || hour < 0) return message.channel.send("Put a valid time between 0 and 23 (time zone in ET)");
            const doc = await banner.findOne({ guildID: message.guild.id });
            if (!doc) return message.channel.send("There is no banner document from your server. What are you trying to remove?");
            if (!doc.banners.length) return message.channel.send("There is no banner document from your server. What are you trying to remove?");
            await doc.updateOne({ $pull: { banners: { hour } } });
            bot.doneBanners.delete(message.guild.id);
            return message.channel.send(`The banner with hour ${hour} has been removed.`);
        } else if (args[1].toLowerCase() === "list") {
            const doc = await banner.findOne({ guildID: message.guild.id });
            if (!doc) return message.channel.send("There are no banners set!");
            if (!doc.banners.length) return message.channel.send("There are no banners set!");
            const embed = new MessageEmbed()
                .setTitle("Banners for " + message.guild.name)
                .setDescription(Util.splitMessage(doc.banners.map((e, i) => `${++i}. Banner: ${e.url}\nHour: ${e.hour}:00 ET`).join("\n"), { maxLength: 1950, char: "" })[0]);
            if (!message.guild.features.includes("BANNER")) embed.setFooter("For this to work your server must have Server Boost at level 2 or higher.");
            return message.channel.send({ embeds: [embed] });
        } else return message.channel.send("Invalid mode!");
    }
}
