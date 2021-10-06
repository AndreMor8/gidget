import { MessageEmbed } from "discord.js";

export default class extends SlashCommand {
  constructor(options) {
    super(options);
    this.deployOptions.description = "Who am I behind?";
    this.permissions = {
      user: [0n, 0n],
      bot: [0n, 16384n]
    };
  }
  async run(bot, interaction) {
    const info = bot.application.partial ? await bot.application.fetch() : bot.application;
    const embed = new MessageEmbed()
      .setTitle("Client app information")
      .setThumbnail(info.iconURL({ format: "png" }))
      .setColor("YELLOW")
      .addField("Client ID", info.id)
      .addField("Application name", info.name)
      .addField("Description", info.description || "?")
      .addField("Public bot?", info.botPublic ? "Yes" : "No")
      .addField("Requires OAuth2 code grant?", info.botRequireCodeGrant ? "Yes" : "No")
      .addField("Owner", info.owner.toString())
    await interaction.reply({ ephemeral: true, embeds: [embed] });
  }
}