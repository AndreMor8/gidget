import Command from '../../utils/command.js';

export default class extends Command {
  constructor(options) {
    super(options);
    this.description = "Coin flip";
  }
  async run(message, args) {
    let options = ['Heads', 'Tails'];

    let output = options[Math.floor(Math.random() * options.length)];

    message.channel.send(`You got: **${output}**!`);
  }
}