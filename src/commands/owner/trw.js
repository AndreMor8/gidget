import Discord from 'discord.js';
import Command from '../../utils/command.js';

export default class extends Command {
    constructor(options) {
        super(options)
        this.aliases = [];
        this.secret = true;
        this.owner = true;
        this.description = "The real Wubbzy webhook";
    }
    async run(bot, message, args) {
        if (message.deletable)
            message.delete();

        const hook = new Discord.WebhookClient(process.env.TRW_ID, process.env.TRW_TOKEN);

        if (!args[1]) return message.reply(`Nothing to say?`).then(message => message.delete({ timeout: 5000 }));

        hook.send(args.slice(1).join(" "));
    }
}