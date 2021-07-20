import { MessageEmbed } from "discord.js"

export default class extends SlashCommand {
    constructor(options) {
        super(options);
        this.deployOptions.description = "My server and user count";
        this.permissions = {
            user: [0n, 0n],
            bot: [0n, 16384n]
        }
    }
    async run(bot, interaction) {
        const servers = (await bot.shard.broadcastEval(c => c.guilds.cache)).map(e => e.length).reduce((acc, guildCount) => acc + guildCount, 0);
        const users = (await bot.shard.broadcastEval(c => c.users.cache)).map(e => e.length).reduce((acc, userCount) => acc + userCount, 0);
        //const servers = bot.guilds.cache.size;
        //const users = bot.users.cache.size;
        const members = Array.prototype.concat.apply([], await bot.shard.broadcastEval(c => c.guilds.cache.map(e => e.memberCount)));
        const average = Math.round(members.reduce((p, c) => c += p) / members.length);
        const serverEmbed = new MessageEmbed()
            .setDescription(`At the moment I'm in **${servers}** servers and with **${users}** cached online users.`, true)
            .setFooter(`I have an average of ${average} members in the number of members of all servers I'm in`)
            .setColor(0xfffff9)
        await interaction.reply({ embeds: [serverEmbed], ephemeral: true });
    }
}