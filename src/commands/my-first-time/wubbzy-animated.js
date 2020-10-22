//Note that if you dont like this command you can delete it safely because i made this when i was new to discordjs and it is not neccesary to the bot
export default class extends Command {
  constructor(options) {
    super(options);
    this.aliases = []
    this.description = "Wubbzy in a animated version"
  }
  async run(bot, message) {
 await message.channel.send("<a:WubbzyFaceA:612311062611492900>")
  }
}