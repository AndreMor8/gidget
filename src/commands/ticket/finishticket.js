import MessageModel from "../../database/models/ticket.js";
export default class extends Command {
  constructor(options) {
    super(options);
    this.description = "Finish listening tickets";
    this.guildonly = true;
    this.permissions = {
      user: [8n, 0n],
      bot: [0n, 0n]
    };

  }
  async run(bot, message, args) {
    if (!args[1]) return message.channel.send("Put the message ID of that ticket system!");
    const msgDocument = await MessageModel.findOne({
      guildId: message.guild.id,
      messageId: args[1]
    }).catch(err => console.log(err));
    if (msgDocument) {
      msgDocument.deleteOne().then(() => message.channel.send('Ok, I removed that from my database. Remember to delete the message!'));
    } else {
      await message.channel.send('I don\'t see a ticket system here.');
    }
  }
}