import Command from "../../utils/command.js";

//Note that if you dont like this command you can delete it safely because i made this when i was new to discordjs and it is not neccesary to the bot
export default class extends Command {
  constructor(options) {
    super(options);
    this.aliases = [];
    this.description = "Widget fix something";
  }
  async run(message, args) {
    let widget = ["Oops, that's not supposed to happen", "No problemo! <:WidgetWalk:610311126193930240>", "Oops, that wasn't supposed to happen", "I can fix anything <:WidgetFix:626764896184434690>"];
 await message.channel.send(widget[Math.floor(Math.random() * 4)] + ".");
  }
}