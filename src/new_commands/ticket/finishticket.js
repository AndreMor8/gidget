import MessageModel from "../../database/models/ticket.js";
export default class extends SlashCommand {
  constructor(options) {
    super(options);
    this.deployOptions.description = "Finish listening tickets";
    this.deployOptions.options = [{
      name: "message",
      type: 3,
      description: "Message ID that relates a ticket system",
      required: true
    }];
    this.guildonly = true;
    this.permissions = {
      user: [8n, 0n],
      bot: [0n, 0n]
    };

  }
  async run(bot, interaction) {
    const msgDocument = await MessageModel.findOneAndDelete({
      guildId: { $eq: interaction.guild.id },
      messageId: { $eq: interaction.options.getString("message", true) }
    }).lean().exec();

    if (msgDocument) await interaction.reply('Ok, I removed that from my database. Remember to delete the message!');
    else await interaction.reply('I don\'t see a ticket system here.');
  }
}