export default class extends Command {
  constructor(options) {
    super(options);
    this.description = "Coin flip";
  }
  async run(bot, message) {
    const options = ['Heads', 'Tails'];

    const output = options[Math.floor(Math.random() * options.length)];

    await message.channel.send(`You got: **${output}**!`);
  }
}