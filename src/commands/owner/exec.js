import util from 'util';
import ch from "child_process";
const exec = util.promisify(ch.exec);
import { Util } from "discord.js";
import Command from '../../utils/command.js';

export default class extends Command {
    constructor(options) {
        super(options)
        this.description = "Execute terminal commands";
        this.dev = true;
        this.secret = true;
    }
    async run(bot, message, args) {
        try {
            const { stdout, stderr } = await exec(args.slice(1).join(" "));
            if (!stdout && !stderr) return message.channel.send("Command executed, but no output");
            if (stdout) {
                const text = Util.splitMessage(stdout, { maxLength: 1950 });
                await message.channel.send(text[0], { code: "sh" });
            }
            if (stderr) {
                const text = Util.splitMessage(stderr, { maxLength: 1950 });
                await message.channel.send(text[0], { code: "sh" });
            }
        } catch (error) {
            const text = Util.splitMessage(error.toString(), { maxLength: 1950 });
            await message.channel.send(text[0], { code: "sh" });
        }
    }
}