import commons from '../../utils/commons.js';
const { require, __dirname, __filename } = commons(import.meta.url);
import Discord from "discord.js";
import Command from "../../utils/command.js";
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
      let evaluated = await eval("(async () => { " + args.slice(1).join(" ") + "})();");
      if (typeof evaluated !== "string") evaluated = util.inspect(evaluated, { depth: 0 });
      const arr = Discord.Util.splitMessage(evaluated, { maxLength: 1950 });
   await message.channel.send(arr[0], { code: "js" });
    } catch (err) {
      const arr = Discord.Util.splitMessage(err.toString(), { maxLength: 1950 });
   await message.channel.send("```js\n" + arr[0] + "```");
    }
  }
}