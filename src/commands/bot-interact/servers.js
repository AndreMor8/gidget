
import { MessageEmbed } from "discord.js"

export default class extends Command {
    constructor(options) {
        super(options);
        this.aliases = [];
        this.description = "Server and user count";
        this.permissions = {
            user: [0, 0],
            bot: [0, 16384]
        }
    }
    async run(bot, message) {
        const servers = (await bot.shard.fetchClientValues('guilds.cache.size')).reduce((acc, guildCount) => acc + guildCount, 0);
        const users = (await bot.shard.fetchClientValues('users.cache.size')).reduce((acc, userCount) => acc + userCount, 0);
        //let servers = bot.guilds.cache.size;
        //let users = bot.users.cache.size;
        const serverEmbed = new MessageEmbed()
            .setDescription("At the moment I'm in **" + servers + "** servers and with **" + users + "** cached online users.", true)
            .setColor(0xf7a7ff)
            .setFooter('Requested by ' + message.author.username, message.author.displayAvatarURL());
        await message.channel.send(serverEmbed)
    }
}