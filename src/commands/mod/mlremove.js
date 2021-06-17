import MessageModel from "../../database/models/roles.js";

export default class extends Command {
  constructor(options) {
    super(options);
    this.aliases = [];
    this.guildonly = true;
    this.description = "Removes a user from the guild list of roles to retrieve";
    this.permissions = {
      user: [8n, 0n],
      bot: [0n, 0n]
    }
  }
  async run(bot, message, args) {
    if(!args[1]) return message.channel.send("Put someone's ID");
    const msgDocument = MessageModel.findOne({ guildid: message.guild.id, memberid: args[1] });
    if (msgDocument) {
      await msgDocument.deleteOne().then(() => message.channel.send("I removed that user from my database")).catch(err => message.channel.send("Some error ocurred. Here's a debug: " + err));
    } else {
      await message.channel.send('That user isn\'t in my database');
    }
  }
}