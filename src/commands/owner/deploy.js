export default class extends Command {
    constructor(options) {
        super(options);
        this.secret = true;
        this.description = "Deploy slash commands";
        this.owner = true;
    }
    async run(bot, message) {
        const arrGlobal = [];
        const arrServer = [];
        for (const command of Array.from(bot.slashCommands.values())) {
            const obj = {};
            for (const thing of Object.entries(command)) {
                if (thing[0] === "guildonly") continue;
                if (thing[0] === "onlyguild") continue;
                if (thing[0] === "permissions") continue;
                obj[thing[0]] = thing[1];
            }
            if (command.onlyguild) arrServer.push(obj);
            else arrGlobal.push(obj);
        }
        console.log(arrGlobal, arrServer);
        await bot.application?.commands.set(arrGlobal);
        await bot.guilds.cache.get(process.env.GUILD_ID)?.commands.set(arrServer);
        if (bot.application) message.channel.send("Slash commands deployed");
        else message.channel.send("Slash commands not deployed");
    }
}
