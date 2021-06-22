export default class extends Command {
  constructor(options) {
    super(options);
    this.description = "Make me say something",
      this.permissions = {
        user: [0n, 0n],
        bot: [0n, 0n]
      }
  }
  async run(bot, message, args) {
    if (message.deletable) await message.delete();
    if (!args[1]) return message.reply(`Nothing to say?`);
    await message.channel.send(args.slice(1).join(" "));
  }
}
