//Note that if you dont like this command you can delete it safely because i made this when i was new to discordjs and it is not neccesary to the bot
export default class extends Command {
  constructor(options) {
    super(options);
    this.description = "A little command. Nothing else.";
  }
  async run(bot, message, args) {
    const wubbzy = ["beautiful", "cute", "the best", "our favorite", "awesome"];
    const text = "Wubbzy is ";
    if (args[1]) {
      const number = parseInt(args[1]);
      if (!isNaN(number) && number < 5 && number >= 0) await message.channel.send(text + wubbzy[number] + " <a:WubbzyFaceA:612311062611492900>")
      else await message.channel.send(text + wubbzy[Math.floor(Math.random() * 5)] + " <a:WubbzyFaceA:612311062611492900>")
    } else {
      await message.channel.send(text + wubbzy[Math.floor(Math.random() * 5)] + " <a:WubbzyFaceA:612311062611492900>");
    }
  }
}