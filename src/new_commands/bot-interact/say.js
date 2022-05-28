import { MessageEmbed, MessageAttachment, Util } from "discord.js";

export default class extends SlashCommand {
  constructor(options) {
    super(options);
    this.deployOptions.description = "Make the bot repeat you";
    this.deployOptions.options = [
      {
        name: "to-say",
        description: "Why else, what I will repeat.",
        type: "STRING",
        required: false
      },
      {
        name: "repeat-message",
        description: "Repeat a message from this channel (interactions excluded). Put a message ID.",
        type: "STRING",
        required: false
      }
    ];
  }
  async run(bot, interaction) {
    if (interaction.options.getString("to-say", false)) {
      await interaction.channel.send({ content: interaction.options.getString("to-say") });
      await interaction.reply({ content: "Done.", ephemeral: true });
      return;
    }
    if (interaction.options.getString("repeat-message", false)) {
      await interaction.deferReply({ ephemeral: true });
      const msg = await interaction.channel.messages.fetch(interaction.options.getString("repeat-message")).catch(() => { });
      if (!msg) return interaction.reply({ content: "Message not found...", ephemeral: true });
      const embeds = msg.embeds.map((e) => new MessageEmbed(e));
      const files = msg.attachments.map(e => new MessageAttachment(e.url, e.name));
      await interaction.channel.send({ content: Util.splitMessage(msg.content, { maxLength: "2048", char: "" })[0] || undefined, embeds, files });
      await interaction.editReply({ content: "Done.", ephemeral: true });
      return;
    }
  }
}