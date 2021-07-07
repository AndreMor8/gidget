import util from 'util';
import ch from "child_process";
const exec = util.promisify(ch.exec);
import { Util, Formatters } from "discord.js";
export default class extends Command {
    constructor(options) {
        super(options)
        this.description = "Execute terminal commands";
        this.dev = true;
        this.secret = true;
    }
    async run(bot, message, args) {
        if(!args[1]) return message.channel.send("Put some command to send to the console");
        try {
            exec(args.slice(1).join(" ")).then(e => {
                const { stdout, stderr } = e;
                if (!stdout && !stderr) return message.channel.send("Command executed, but no output");
                if (stdout) {
                    const text = Util.splitMessage(stdout, { maxLength: 1950, char: "" });
                    message.channel.send(Formatters.codeBlock("sh", text[0]));
                }
                if (stderr) {
                    const text = Util.splitMessage(stderr, { maxLength: 1950, char: "" });
                    message.channel.send(Formatters.codeBlock("sh", text[0]));
                }
            }).catch(e => {
                const text = Util.splitMessage(util.inspect(e, { depth: 0 }), { maxLength: 1950, char: "" });
                message.channel.send(Formatters.codeBlock("sh", text[0]));
            });
        } catch (error) {
            const text = Util.splitMessage(util.inspect(error, { depth: 0 }), { maxLength: 1950, char: "" });
            await message.channel.send(Formatters.codeBlock("sh", text[0]));
        }
    }
}
