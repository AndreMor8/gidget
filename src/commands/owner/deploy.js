export default class extends Command {
    constructor(options) {
        super(options);
        this.secret = true;
        this.description = "Deploy slash commands";
        this.owner = true;
    }
    async run(bot, message) {
        if (bot.user.id === "709980693647851600") {
            await bot.guilds.cache.get(process.env.GUILD_ID)?.commands.set(bot.slashCommands.map(a => a.deployOptions));
            if (bot.guilds.cache.get(process.env.GUILD_ID)) message.channel.send("Slash commands deployed");
            else message.channel.send("Slash commands not deployed");
        } else {
            const [arrServer, arrGlobal] = bot.slashCommands.partition(e => e.onlyguild).map(e => e.map(a => a.deployOptions));
            await bot.application?.commands.set(arrGlobal);
            await bot.guilds.cache.get(process.env.GUILD_ID)?.commands.set(arrServer);
            if (bot.application) message.channel.send("Slash commands deployed");
            else message.channel.send("Slash commands not deployed");
        }
    }
}
