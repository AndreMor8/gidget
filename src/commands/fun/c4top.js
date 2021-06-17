import { MessageEmbed } from 'discord.js';
import c4top from '../../database/models/c4.js';
export default class extends Command {
    constructor(options) {
        super(options);
        this.description = "The famous Connect4 game";
        this.permissions = {
            user: [0n, 0n],
            bot: [0n, 16384n]
        };
        this.aliases = ["c4-top"];
        this.guildonly = true;
    }
    async run(bot, message, args) {

        switch (args[1]) {
            case 'global': {
                const difficulty = ["hard", "medium", "easy"].includes(args[2]?.toLowerCase()) ? args[2]?.toLowerCase() : "medium";
                const data = await c4top.find({ difficulty }).sort([['wins', 'descending']]).exec();
                if (!data.length) return message.channel.send("No data yet!");
                const toshow = data.slice(0, 10);
                const embed = new MessageEmbed()
                    .setTitle(`Connect4 Global Top Winners (${difficulty})`);
                for (const info of toshow) {
                    embed.addField(info.cacheName || '?', `**Wins:** ${info.wins}\t**Loses:** ${info.loses}`);
                }
                message.channel.send({embeds: [embed]});
            }
                break;
            case 'server':
            default: {
                const difficulty = args[2] ? (["hard", "medium", "easy"].includes(args[2].toLowerCase()) ? args[2].toLowerCase() : "medium") : (["hard", "medium", "easy"].includes(args[1]?.toLowerCase()) ? args[1]?.toLowerCase() : "medium");
                const data = await c4top.find({ difficulty }).sort([['wins', 'descending']]).exec();
                const toshow = data.slice(0, 10).filter(e => message.guild.members.cache.has(e.userId));
                if (!toshow.length) return message.channel.send("No data yet!");
                const embed = new MessageEmbed()
                    .setTitle(`Connect4 Top Winners (${difficulty})`);
                for (const info of toshow) {
                    embed.addField(info.cacheName || '?', `**Wins:** ${info.wins}\t**Loses:** ${info.loses}`);
                }
                if(!args[1]) embed.setAuthor("g%c4top [server/global] [difficulty]");
                message.channel.send({embeds: [embed]});
            }
        }
    }
}