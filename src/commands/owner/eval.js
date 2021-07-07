import commons from '../../utils/commons.js';
// eslint-disable-next-line no-unused-vars
const { require, __dirname, __filename } = commons(import.meta.url);
import Discord from "discord.js";
import util from 'util';
export default class extends Command {
  constructor(options) {
    super(options);
    this.aliases = ["ev"];
    this.secret = true;
    this.description = "Eval a code via command";
    this.dev = true;
  }
  async run(bot, message, args) {
    if (!args[1]) return message.channel.send("Put something to evaluate.");
    try {
      let evaluated = eval(args.slice(1).join(" "));
      if (evaluated instanceof Promise) {
        const m = await message.channel.send("Evaluating promise...");
        evaluated.then((e => {
          let evaluated = e;
          if (typeof evaluated !== "string") evaluated = util.inspect(evaluated, { depth: 0 });
          const arr = Discord.Util.splitMessage(evaluated, { maxLength: 1950, char: "" });
          m.edit(Discord.Formatters.codeBlock("js", arr[0]));
        })).catch((e => {
          let evaluated = e;
          if (typeof evaluated !== "string") evaluated = util.inspect(evaluated, { depth: 0 });
          const arr = Discord.Util.splitMessage(evaluated, { maxLength: 1950, char: "" });
          m.edit(Discord.Formatters.codeBlock("js", arr[0]));
        }));
      } else {
        if (typeof evaluated !== "string") evaluated = util.inspect(evaluated, { depth: 0 });
        const arr = Discord.Util.splitMessage(evaluated, { maxLength: 1950, char: "" });
        await message.channel.send(Discord.Formatters.codeBlock("js", arr[0]));
      }
    } catch (err) {
      let algo = err;
      if (typeof algo !== "string") algo = util.inspect(algo, { depth: 0 });
      const arr = Discord.Util.splitMessage(algo, { maxLength: 1950, char: "" });
      await message.channel.send(Discord.Formatters.codeBlock("js", arr[0]));
    }
  }
}
