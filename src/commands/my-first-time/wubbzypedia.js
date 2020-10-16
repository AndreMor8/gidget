import Command from "../../utils/command.js"

//Note that if you dont like this command you can delete it safely because i made this when i was new to discordjs and it is not neccesary to the bot
export default class extends Command {
  constructor(options) {
    super(options);
    this.description = "Link to Wubbzypedia"
    this.onlyguild = true
  }
  async run(bot, message, args) {
 await message.channel.send('Wubbzypedia is the best wiki for all the information of the series Wow! Wow! Wubbzy!, the characters, episodes, merchandise and much more! Here is the link: https://wubbzy.fandom.com/')
  }
}