//Note that if you dont like this command you can delete it safely because i made this when i was new to discordjs and it is not neccesary to the bot
import Command from '../../utils/command.js';
export default class extends Command {
  constructor(options) {
    super(options);
    this.description = "A little command. Nothing else.";
  }
  async run(message, args) {
    let wubbzy = ["beautiful", "cute", "the best", "our favorite", "awesome"];
    let text = "Wubbzy is ";
    if (args[1]) {
      let number = parseInt(args[1]);
      if (!isNaN(number) && number < 5 && number >= 0) {
        message.channel.send(text + wubbzy[number] + " <a:WubbzyFaceA:612311062611492900>");
      } else {
        message.channel.send(text + wubbzy[Math.floor(Math.random() * 5)] + " <a:WubbzyFaceA:612311062611492900>");
      }
    } else {
      message.channel.send(text + wubbzy[Math.floor(Math.random() * 5)] + " <a:WubbzyFaceA:612311062611492900>");
    }
  }
}