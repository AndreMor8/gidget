import { MessageEmbed } from 'discord.js';

export default class extends SlashCommand {
  constructor(options) {
    super(options);
    this.deployOptions.description = "Receive a link to invite the bot";
  }
  async run(bot, interaction) {
    await interaction.reply({
      embeds: [new MessageEmbed()
        .setTitle("Invite links!")
        .setColor("#848484")
        .addField("Invite the bot to your server", (await bot.generateInvite({ additionalScopes: ["applications.commands"] })) + "\nThanks for adding me!")
        .addField("Support server", "https://discord.gg/KDy4gJ7")
        .addField("Wow Wow Discord", "https://discord.gg/5qx9ZcV\nIf you are a fan of the Wubbzy series, join this server! It's managed by 4 big fans of the series :)")],
      ephemeral: true
    });
  }
}