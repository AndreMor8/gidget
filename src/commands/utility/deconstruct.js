import { MessageEmbed, SnowflakeUtil } from "discord.js";

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
    if (!args[1])
      return message.channel.send("Put a snowflake. Clue: It's a ID");
    if (args[1].length > 19)
      return message.channel.send("I don't think Discord's snowflakes have gotten to those points.");
    if (!Number(args[1]))
      return message.channel.send("Put a real snowflake!");
    const data = SnowflakeUtil.deconstruct(args[1]);
    const embed = new MessageEmbed()
      .setTitle("Deconstructed snowflake")
      .setColor("BLUE")
      .setTimestamp(data.date)
      .addField("Date", bot.botIntl.format(data.date))
      .addField("Worker ID", data.workerID.toString(), true)
      .addField("Process ID", data.processID.toString(), true)
      .addField("Increment", data.increment.toString(), true)
      .addField("Binary representation", data.binary);
    await message.channel.send({ embeds: [embed] });
  }
}