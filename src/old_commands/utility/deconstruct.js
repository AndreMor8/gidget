import { EmbedBuilder, SnowflakeUtil } from "discord.js";

export default class extends Command {
  constructor(options) {
    super(options);
    this.description = "De-structure a snowflake to indicate data.";
    this.permissions = {
      user: [0n, 0n],
      bot: [0n, 16384n]
    };
  }
  async run(bot, message, args) {
    if (!args[1]) return message.channel.send("Put a snowflake. Clue: It's a ID");
    if (args[1].length > 19) return message.channel.send("I don't think Discord's snowflakes have gotten to those points.");
    if (!Number(args[1])) return message.channel.send("Put a real snowflake!");
    const data = SnowflakeUtil.deconstruct(args[1]);
    const embed = new EmbedBuilder()
      .setTitle("Deconstructed snowflake")
      .setColor("Blue")
      .setTimestamp(data.date)
      .addFields([
        { name: "Date", value: bot.botIntl.format(data.date) },
        { name: "Worker ID", value: data.workerId.toString(), inline: true },
        { name: "Process ID", value: data.processId.toString(), inline: true },
        { name: "Increment", value: data.increment.toString(), inline: true },
        { name: "Binary representation", value: data.binary },
      ]);
    await message.channel.send({ embeds: [embed] });
  }
}