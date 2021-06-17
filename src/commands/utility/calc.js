import Discord from "discord.js";
import math from "math-expression-evaluator";

export default class extends Command {
  constructor(options) {
    super(options);
    this.description = "Calculate something";
    this.permissions = {
      user: [0n, 0n],
      bot: [0n, 16384n]
    };

  }
  async run(bot, message, args) {
    if (!args[1]) return message.channel.send('Put something to calculate!')

    const embed = new Discord.MessageEmbed()
      .setTitle("📊 Calculator")
      .setColor(`RANDOM`);
    let result;
    try {
      result = math.eval(args.slice(1).join(" "));
    } catch (e) {
      result = `${e.message}`;
    }
    embed.addField("Input:", `\`\`\`js\n${args.slice(1).join(" ")}\`\`\``)
      .addField("Output", `\`\`\`js\n${result}\`\`\``);
    await message.channel.send({embeds: [embed]});
  }
}