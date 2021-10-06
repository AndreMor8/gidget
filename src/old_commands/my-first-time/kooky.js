//Note that if you dont like this command you can delete it safely because i made this when i was new to discordjs and it is not neccesary to the bot
export default class extends Command {
  constructor(options) {
    super(options);
    this.aliases = ["kookykid"];
    this.description = "Kooky Kid";
  }
  async run(bot, message) {
    await message.channel.send("<a:KookyA1:631611151402139688><:Kooky2:631649171396493312><a:KookyA2:631611175817183252>")
  }
}