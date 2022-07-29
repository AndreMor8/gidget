import { EmbedBuilder, AttachmentBuilder, ButtonBuilder, ActionRowBuilder } from "discord.js";
import saybutton from '../../database/models/saybutton.js';
import { splitMessage } from '../../extensions.js';
export default class extends SlashCommand {
  constructor(options) {
    super(options);
    this.deployOptions.description = "Make the bot repeat you";
    this.guildonly = true;
    this.deployOptions.options = [
      {
        name: "to-say",
        description: "Why else, what I will repeat.",
        type: 3,
        required: false
      },
      {
        name: "repeat-message",
        description: "Repeat a message from this channel (interactions excluded). Put a message ID.",
        type: 3,
        required: false
      },
      {
        name: "button",
        description: "(Admin only) Enable or disable author button",
        type: 5,
        required: false
      }
    ];
    this.permissions = {
      user: [0n, 0n],
      bot: [0n, 3072n]
    }
  }
  async run(bot, interaction) {
    const authorButton = new ActionRowBuilder().addComponents([new ButtonBuilder()
      .setCustomId("author-button")
      .setDisabled(true)
      .setStyle("Secondary")
      .setLabel(`Sent by ${interaction.user.tag} @ ${interaction.user.id}`)]);
    const doc = (await saybutton.findOne({ guildId: { $eq: interaction.guildId } }).lean()) || (await saybutton.create({ guildId: interaction.guildId }));

    if (interaction.options.getString("to-say", false)) {
      await interaction.channel.send({ content: interaction.options.getString("to-say"), components: doc.enabled ? [authorButton] : undefined });
      await interaction.reply({ content: "Done.", ephemeral: true });
      return;
    }
    if (interaction.options.getString("repeat-message", false)) {
      await interaction.deferReply({ ephemeral: true });
      const msg = await interaction.channel.messages.fetch({ message: interaction.options.getString("repeat-message") }).catch(() => { });
      if (!msg) return await interaction.editReply({ content: "Message not found...", ephemeral: true });
      const embeds = msg.embeds.map((e) => EmbedBuilder.from(e));
      const files = msg.attachments.map(e => new AttachmentBuilder(e.url, { name: e.name, description: e.description }));
      await interaction.channel.send({ content: splitMessage(msg.content, { maxLength: "2048", char: "" })[0] || undefined, embeds, files, components: doc.enabled ? [authorButton] : undefined });
      await interaction.editReply({ content: "Done.", ephemeral: true });
      return;
    }
    if (typeof interaction.options.getBoolean("button", false) === "boolean") {
      if (!interaction.member.permissions.has(8n)) return await interaction.reply({ content: "You aren't admin.", ephemeral: true });
      await saybutton.updateOne({ guildId: { $eq: interaction.guildId } }, { $set: { enabled: interaction.options.getBoolean("button") } });
      await interaction.reply({ content: `Author button ${interaction.options.getBoolean("button") ? "enabled" : "disabled.\nThe bot is not responsible for the messages made with this command. There is no way of knowing who made them.."}.`, ephemeral: true });
      return;
    }
    return await interaction.reply({ content: "Usage: `/say to-say:<text>`", ephemeral: true });
  }
}