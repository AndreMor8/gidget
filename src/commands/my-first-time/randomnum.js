import Command from "../../utils/command.js";

//Note that if you dont like this command you can delete it safely because i made this when i was new to discordjs and it is not neccesary to the bot
export default class extends Command {
  constructor(options) {
    super(options);
    this.aliases = ["number", "random", "numrandom", "randomnumber", "numberrandom", "rn"];
    this.description = "Random number";

  }
  async run(bot, message, args) {
    if (args[1].length > 11) return message.channel.send("I don't think I can handle that.")
    let number = parseInt(args[1])
    if (!isNaN(number)) {
   await message.channel.send(Math.floor(Math.random() * number))
    } else {
   await message.channel.send(Math.floor(Math.random() * 100))
    }
  }
}