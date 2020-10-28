
export default class extends Command {
  constructor(options) {
    super(options);
    this.description = "Make me say something",
      this.permissions = {
        user: [0, 0],
        bot: [0, 0]
      }
  }
  async run(bot, message, args) {
    // Check if you can delete the message
    if (message.deletable) await message.delete();
    if (!args[1]) return message.reply(`Nothing to say?`).then(m => m.delete({ timeout: 5000 }));
    await message.channel.send(args.slice(1).join(" "));
  }
}
