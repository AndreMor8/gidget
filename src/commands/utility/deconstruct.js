import { MessageEmbed, Snowflake } from "discord.js";


export default class extends Command {
  constructor(options) {
    super(options);
    this.description = "De-structure a snowflake to indicate data.";
    this.permissions = {
      user: [0, 0],
      bot: [0, 16384]
    };
  }
  async run(bot, message, args) {
    if (!args[1])
      return message.channel.send("Put a snowflake. Clue: It's a ID");
    if (args[1].length > 19)
      return message.channel.send("I don't think Discord's snowflakes have gotten to those points.");
    if (!Number(args[1]))
      return message.channel.send("Put a real snowflake!");
    const data = Snowflake.deconstruct(args[1]);
    const embed = new MessageEmbed()
      .setTitle("Deconstructed snowflake")
      .setColor("BLUE")
      .setTimestamp(data.date)
      .addField("Date", data.date.toLocaleString())
      .addField("Worker ID", data.workerID, true)
      .addField("Process ID", data.processID, true)
      .addField("Increment", data.increment, true)
      .addField("Binary representation", data.binary);
    await message.channel.send(embed);
  }
}