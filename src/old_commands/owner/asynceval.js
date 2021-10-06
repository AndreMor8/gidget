import commons from '../../utils/commons.js';
// eslint-disable-next-line no-unused-vars
const { require, __dirname, __filename } = commons(import.meta.url);
import Discord from "discord.js";
import util from 'util';

export default class extends Command {
  constructor(options) {
    super(options);
    this.aliases = ["ev", "aeval"];
    this.secret = true;
    this.description = "Eval a code via command";
    this.dev = true;
  }
  async run(bot, message, args) {
    if (!args[1]) return message.channel.send("Put something to evaluate.\nThis allows using async/await without complications\nRemember to put `return` or this will not return anything.");
    try {
      eval("(async () => { " + args.slice(1).join(" ") + "})();").then(e => {
        let evaluated = e;
        if (typeof evaluated !== "string") evaluated = util.inspect(evaluated, { depth: 0 });
        const arr = Discord.Util.splitMessage(evaluated, { maxLength: 1950, char: "" });
        message.channel.send(Discord.Formatters.codeBlock("js", arr[0]));
      }).catch(e => {
        let evaluated = e;
        if (typeof evaluated !== "string") evaluated = util.inspect(evaluated, { depth: 0 });
        const arr = Discord.Util.splitMessage(evaluated, { maxLength: 1950, char: "" });
        message.channel.send(Discord.Formatters.codeBlock("js", arr[0]));
      })
    } catch (err) {
      let cosa = err;
      if (typeof cosa !== "string") cosa = util.inspect(cosa, { depth: 0 });
      const arr = Discord.Util.splitMessage(cosa, { maxLength: 1950, char: "" });
      await message.channel.send(Discord.Formatters.codeBlock("js", arr[0]));
    }
  }
}
