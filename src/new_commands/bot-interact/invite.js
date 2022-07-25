import { EmbedBuilder } from 'discord.js';

export default class extends SlashCommand {
  constructor(options) {
    super(options);
    this.deployOptions.description = "Receive a link to invite the bot";
  }
  async run(bot, interaction) {
    await interaction.reply({
      embeds: [new EmbedBuilder()
        .setTitle("Invite links!")
        .setColor("#848484")
        .addFields([
          { name: "Invite the bot to your server", value: (await bot.generateInvite({ scopes: ["bot", "applications.commands"] })) + "\nThanks for adding me!" },
          { name: "Support server", value: "https://discord.gg/KDy4gJ7" },
          { name: "Wow Wow Discord", value: "https://discord.gg/5qx9ZcV\nIf you are a fan of the Wubbzy series, join this server! It's managed by 4 big fans of the series :)" }
        ])],
      ephemeral: true
    });
  }
}