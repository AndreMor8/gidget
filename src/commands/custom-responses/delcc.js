export default class extends Command {
  constructor(options) {
    super(options);
    this.aliases = [];
    this.description = "Delete a custom response from the database";
    this.guildonly = true;
    this.permissions = {
      user: [8n, 0n],
      bot: [0n, 0n]
    }
  }
  async run(bot, message, args) {
    if (!args[1]) return message.channel.send("Usage: `delcc <id>`\nUse `listcc` for a ID.");
    if (isNaN(args[1])) return message.channel.send("Invalid ID!");
    await message.guild.deleteCustomResponse(parseInt(args[1]));
    await message.channel.send("Custom response deleted correctly");
  }
}