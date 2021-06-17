
import { MessageEmbed } from "discord.js"

export default class extends Command {
    constructor(options) {
        super(options);
        this.aliases = [];
        this.description = "Server and user count";
        this.permissions = {
            user: [0n, 0n],
            bot: [0n, 16384n]
        }
    }
    async run(bot, message) {
        const servers = (await bot.shard.fetchClientValues('guilds.cache.size')).reduce((acc, guildCount) => acc + guildCount, 0);
        const users = (await bot.shard.fetchClientValues('users.cache.size')).reduce((acc, userCount) => acc + userCount, 0);
        //const servers = bot.guilds.cache.size;
        //const users = bot.users.cache.size;
        const members = Array.prototype.concat.apply([], await bot.shard.broadcastEval(c => c.guilds.cache.map(e => e.memberCount)));
        const average = Math.round(members.reduce((p, c) => c += p) / members.length);
        const serverEmbed = new MessageEmbed()
            .setDescription(`At the moment I'm in **${servers}** servers and with **${users}** cached online users.`, true)
            .setFooter(`I have an average of ${average} members in the number of members of all servers I'm in`)
            .setColor(0xfffff9)
        await message.channel.send({ embeds: [serverEmbed] });
    }
}