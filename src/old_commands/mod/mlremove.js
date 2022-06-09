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
    if (!args[1]) return message.channel.send("Put someone's ID");
    const msgDocument = await MessageModel.findOneAndDelete({ guildid: { $eq: message.guild.id }, memberid: { $eq: args[1] } }).lean().exec();
    if (msgDocument) await message.channel.send("I removed that user from my database");
    else await message.channel.send('That user isn\'t in my database');
  }
}