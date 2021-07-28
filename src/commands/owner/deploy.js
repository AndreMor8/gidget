export default class extends Command {
    constructor(options) {
        super(options);
        this.secret = true;
        this.description = "Deploy slash commands";
        this.owner = true;
    }
    async run(bot, message) {
        //temporal
        if (bot.user.id === "709980693647851600") {
            const [normalC, ctxmC] = bot.slashCommands.partition(e => !e.deployOptions.type);
            const normal = normalC.map(a => a.deployOptions);
            const ctxm = ctxmC.map(a => a.deployOptions);
            await bot.guilds.cache.get(process.env.GUILD_ID)?.commands.set(normal);
            for (const command of ctxm) {
                await bot.api.applications(bot.user.id).guilds(process.env.GUILD_ID).commands.post({ data: command });
            }
            if (bot.guilds.cache.get(process.env.GUILD_ID)) message.channel.send("Slash commands deployed");
            else message.channel.send("Slash commands not deployed");
        } else {
            const [arrServer, arrGlobal] = bot.slashCommands.partition(e => e.onlyguild);
            const [globalNormal, globalctxm] = arrGlobal.partition(e => !e.deployOptions.type);
            const [serverNormal, serverctxm] = arrServer.partition(e => !e.deployOptions.type);
            await bot.application?.commands.set(globalNormal.map(a => a.deployOptions));
            for (const command of globalctxm.map(a => a.deployOptions)) {
                await bot.api.applications(bot.user.id).commands.post({ data: command });
            }
            await bot.guilds.cache.get(process.env.GUILD_ID)?.commands.set(serverNormal.map(a => a.deployOptions));
            for (const command of serverctxm.map(a => a.deployOptions)) {
                await bot.api.applications(bot.user.id).guilds(process.env.GUILD_ID).commands.post({ data: command });
            }
            if (bot.application) message.channel.send("Slash commands deployed");
            else message.channel.send("Slash commands not deployed");
        }
    }
}
