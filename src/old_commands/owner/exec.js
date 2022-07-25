import util from 'util';
import ch from "child_process";
const exec = util.promisify(ch.exec);
import { Formatters } from "discord.js";
import { splitMessage } from '../../extensions.js';

export default class extends Command {
  constructor(options) {
    super(options)
    this.description = "Execute terminal commands";
    this.dev = true;
    this.secret = true;
  }
  async run(bot, message, args) {
    if (!args[1]) return message.channel.send("Put some command to send to the console");
    try {
      exec(args.slice(1).join(" ")).then(async e => {
        const { stdout, stderr } = e;
        if (!stdout && !stderr) return message.channel.send("Command executed, but no output");
        if (stdout) await send(message, stdout)
        if (stderr) await send(message, stderr)
      }).catch(async e => await send(message, e, true));
    } catch (error) {
      await send(message, error, true)
    }
  }
}

const send = async (message, txt, inspect = false) => {
  const text = splitMessage(inspect ? util.inspect(txt, { depth: 0 }) : txt, { maxLength: 1950, char: "" });
  await message.channel.send(Formatters.codeBlock("sh", text[0]));
}
