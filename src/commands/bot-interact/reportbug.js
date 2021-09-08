export default class extends Command {
  constructor(options) {
    super(options);
    this.description = "This sends a link to the Gidget feedback section so you can report a bug.";
    this.aliases = ["rpb", "bugs"];
  }
  async run(bot, message) {
    await message.channel.send("Did you find a bug in this bot? Go to the feedback section on the bot's official page: https://gidget.xyz/feedback *(needs login)*")
  }
}