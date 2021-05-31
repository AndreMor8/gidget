import { Util } from 'discord.js';
export default class extends Command {
    constructor(options) {
        super(options);
        this.description = "Convert binary to common text";
    }
    async run(bot, message, args) {
        if(!args[1]) return message.channel.send("Usage: `b2t <binary>`");
        const newBin = args.slice(1);
        const binCode = [];
        for (let i = 0; i < newBin.length; i++) {
            const num = parseInt(newBin[i], 2);
            if(!num) return message.channel.send("Are you sure that's binary?")
            binCode.push(String.fromCharCode(num));
        }
        await message.channel.send(`\`Output:\` ${Util.splitMessage(binCode.join(""), { char: " ", maxLength: 2000 })[0]}`);
    }
}