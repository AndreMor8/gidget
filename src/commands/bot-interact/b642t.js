import { Util } from 'discord.js';
export default class extends Command {
    constructor(options) {
        super(options);
        this.description = "Convert Base64 to common text";
    }
    async run(bot, message, args) {
        if (!args[1]) return message.channel.send("Put some text");
        const out = Buffer.from(args.slice(1).join(" "), "base64").toString();
        await message.channel.send(`\`Output:\` ${Util.splitMessage(out, { maxLength: 2000, char: "" })[0]}`);
    }
}