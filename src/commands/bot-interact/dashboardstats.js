import { MessageEmbed } from "discord.js";
import fetch from 'node-fetch';
export default class extends Command {
    constructor(options) {
        super(options)
        this.description = "Bot stats";
        this.permissions = {
            user: [0, 0],
            bot: [0, 16384]
        };
        this.aliases = ["dashboard-stats", "dash"]
    }
    async run(bot, message) {
        const res = await fetch("https://gidget.xyz/stats?format=json");
        if(!res.ok) return message.channel.send(`\`https://gidget.xyz/stats\` returned ${res.status} (${res.statusText})`);
        const json = await res.json();
        const embedStats = new MessageEmbed()
            .setTitle("***Dashboard Stats***")
            .setColor("RANDOM")
            .setDescription(`https://gidget.xyz/stats`)
            .addField("• RAM", `${memory(json.totalmem - json.freemem, false)} / ${memory(json.totalmem)}`, true)
            .addField(`• Dashboard RAM usage`, memory(json.memoryrssusage), true)
            .addField("• Uptime ", json.uptime, true)
            .addField("• Node.js", json.nodeversion, true)
            .addField("• Hosting service", json.hoster, true)
            .addField("• Operating system", json.system)
            .addField("• CPU", json.cpu)
            .addField("• Arch", json.arch, true)
            .addField("• Platform", json.platform, true)
            .setFooter("Gidget stats");

        await message.channel.send(embedStats)
    }
}

/**
 * @param {Number} bytes
 * @param {Boolean} r
 * @returns {string}
 */
function memory(bytes = 0, r = true) {
    const gigaBytes = bytes / 1024 ** 3;
    if (gigaBytes > 1) {
        return `${gigaBytes.toFixed(1)} ${r ? "GB" : ""}`;
    }

    const megaBytes = bytes / 1024 ** 2;
    if (megaBytes > 1) {
        return `${megaBytes.toFixed(2)} ${r ? "MB" : ""}`;
    }

    const kiloBytes = bytes / 1024;
    if (kiloBytes > 1) {
        return `${kiloBytes.toFixed(2)} ${r ? "KB" : ""}`;
    }

    return `${bytes.toFixed(2)} ${r ? "B" : ""}`;
}
