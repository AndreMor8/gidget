export default class extends Command {
    constructor(options) {
        super(options);
        this.description = "Messages from a news channel will be automatically crossposted.";
        this.permissions = {
            user: [8n, 0n],
            bot: [0n, 0n]
        }
        this.guildonly = true;
    }
    async run(bot, message, args) {
        if (!args[1]) return message.channel.send("Use: `autopost <mode> <channel>`\nModes: `add`, `delete`, `get`");
        switch (args[1]) {
            case 'add': {
                if (!args[2]) message.channel.send("Please put a channel!");
                const channel = message.mentions.channels.filter(e => e.guild.id === message.guild.id && e.type === "news").first() || message.guild.channels.cache.get(args[2]) || await message.guild.channels.fetch(args[2] || "123").catch(() => {});
                if (!channel) return message.channel.send("A valid channel has not been set. Only news channels are allowed.");
                if (!channel.permissionsFor(message.guild.me.id).has(["SEND_MESSAGES", "MANAGE_MESSAGES"])) return message.channel.send("I don't have the permissions to crosspost on that channel.\nGive me the permissions to manage messages and send messages.");
                await message.guild.setAutoPostChannel(channel);
                message.channel.send(`The ${channel} channel has been added for crossposting!`);
            }
                break;
            case 'delete': {
                if (!args[2]) message.channel.send("Please put a channel!");
                let channel = message.mentions.channels.filter(e => e.guild.id === message.guild.id && e.type === "news").first() || message.guild.channels.cache.get(args[2]) || await message.guild.channels.fetch(args[2] || "123").catch(() => {});
                if (!channel) {
                    if (args[2].length > 20) return message.channel.send("Invalid channel!");
                    if (isNaN(args[2])) return message.channel.send("Invalid channel");
                    await message.channel.send("I did not detect a valid channel. Trying with ID...");
                    channel = args[2];
                }
                await message.guild.deleteAutoPostChannel(channel);
                message.channel.send("The mentioned channel has been removed from the list.");
            }
                break;
            case 'get': {
                const doc = message.guild.cache.autopostchannels ? message.guild.autopostchannels : await message.guild.getAutoPostChannels();
                const str = doc.map(e => `<#${e}>`).join("\n");
                message.channel.send(`List of channels for automatic crossposting:\n\n${str || "*no channels added*"}`);
            }
                break;
            default: {
                message.channel.send("Modes: `add`, `delete`, `get`");
            }
        }
    }
}