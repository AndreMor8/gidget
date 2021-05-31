import { Util } from 'discord.js';
export default class extends Command {
    constructor(options) {
        super(options);
        this.description = "Convert common text to binary";
    }
    async run(bot, message, args) {
        if (!args[1]) return message.channel.send("Put some text");
        const input = args.slice(1).join(" ");
        const output = [];
        for (let i = 0; i < input.length; i++) {
            if(output.length >= 2000) break;
            output.push(input[i].charCodeAt(0).toString(2));
        }
        await message.channel.send(`\`Output:\` ${Util.splitMessage(output.join(" "), { char: " ", maxLength: 2000 })[0]}`);
    }
}