export default class extends Command {
  constructor(options) {
    super(options);
    this.description = "Reverse some text";
  }
  async run(bot, message, args) {
    if (!args[1]) return message.reply('You must input text to be reversed!');
    await message.channel.send(args.slice(1).join(' ').split('').reverse().join(''));
  }
}