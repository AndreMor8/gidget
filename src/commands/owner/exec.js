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
    if (!args[1]) return message.channel.send("Put some command to send to the console");
    try {
      exec(args.slice(1).join(" ")).then(e => {
        const { stdout, stderr } = e;
        if (!stdout && !stderr) return message.channel.send("Command executed, but no output");
        if (stdout) send(message, stdout)
        if (stderr) send(message, stderr)
      }).catch(e => send(message, e, true));
    } catch (error) {
      send(message, error, true)
    }
  }
}

const send = (message, txt, inspect = false) => {
  const text = Util.splitMessage(inspect ? util.inspect(txt, { depth: 0 }) : txt, { maxLength: 1950, char: "" });
  await message.channel.send(Formatters.codeBlock("sh", text[0]));
}
