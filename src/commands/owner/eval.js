//Rewrite
const { Util } = require("discord.js");

module.exports = {
  run: async (bot, message, args) => {
    if (message.author.id !== "577000793094488085") return message.channel.send('Only AndreMor can use this command')
    if (!args[1]) return message.channel.send("Put something to evaluate.");
    try {
      const evaluated = await eval(args.slice(1).join(" "));
      if (typeof evaluated !== "string") evaluated = require("util").inspect(evaluated, { depth: 0 });
      const arr = Util.splitMessage(evaluated, { maxLength: 1950 });
      message.channel.send(arr[0], { code: "js" });
    } catch (err) {
      const arr = Util.splitMessage(err.toString(), { maxLength: 1950 });
      message.channel.send("```js\n" + arr[0] + "```");
    }
  },
  aliases: ["ev"],
  secret: true,
  description: "Eval a code via command"
};
