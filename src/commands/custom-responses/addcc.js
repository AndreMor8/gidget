import safeRegex from 'safe-regex';
export default class extends Command {
  constructor(options) {
    super(options);
    this.description = "Add custom responses in the database.";
    this.guildonly = true;
    this.permissions = {
      user: [8n, 0n],
      bot: [0n, 0n]
    };
  }
  async run(bot, message, args) {
    if (!args[1]) return message.channel.send("Usage: `addcc <match> | <response>`\nThe cases here are global, insensitive, and multi-line.");
    const realargs = args.slice(1).join(" ").split(" | ");
    if (!realargs[0] || !realargs[1]) return message.channel.send("Usage: `addcc <match> | <response>`\nThe cases here are global, insensitive, and multi-line.");
    if (!safeRegex(realargs[0])) return message.channel.send("This isn't a safe regex/string...");
    await message.guild.addCustomResponse(realargs[0], {
      content: realargs[1],
      files: message.attachments.map(e => e.url),
    })
    await message.channel.send("Custom response set correctly");
  }
}