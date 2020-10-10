//Note that if you dont like this command you can delete it safely because i made this when i was new to discordjs and it is not neccesary to the bot
import Command from '../../utils/command.js';
export default class extends Command {
  constructor(options) {
    super(options);
    this.aliases = ["twc", "wubbzyfanon"];
    this.onlyguild = true;
    this.description = "Link to the Wubb Club Wiki";
  }
  async run(message, args) {
 await message.channel.send('In The Wubb Club is all the related fanmade of the Wow! Wow! Wubbzy! series. If you have ypur own fanmade of this series, you can add it here without problems! Here is the link: https://wubbzyfanon.fandom.com/ ')
  }
}