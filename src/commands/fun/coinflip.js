export default class extends Command {
  constructor(options) {
    super(options);
    this.description = "Coin flip";
  }
  async run(bot, message) {
    await message.channel.send(`You got: **${['Heads', 'Tails'][Math.floor(Math.random() * 2)]}**!`);
  }
}