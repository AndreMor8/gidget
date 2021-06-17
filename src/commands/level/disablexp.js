import levelconfig from "../../database/models/levelconfig.js";

export default class extends Command {
    constructor(options) {
        super(options)
        this.permissions = {
            user: [8n, 0n],
            bot: [0n, 0n]
        }
        this.guildonly = true;
        this.description = "Disable XP on certain channels.";
    }
    async run(bot, message, args) {
        if(!args[1]) return message.channel.send("Usage: `disablexp <channel>`");
        const channel = message.mentions.channels.filter(e => e.guild.id === message.guild.id).first() || message.guild.channels.cache.get(args[1]) || message.guild.channels.cache.find(e => e.name === args[1]) || await message.guild.channels.fetch(args[1] || "123").catch(() => {});
        if(!channel) return message.channel.send("Invalid channel!");
        await levelconfig.findOneAndUpdate({ guildId: { $eq: message.guild.id } }, { $push: { nolevel: channel.id } });
        message.guild.cache.levelconfig = false;
        message.channel.send("The channel has been added.");
    }
}