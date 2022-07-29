import { getConfessionConfig } from "../../extensions.js";
import { EmbedBuilder } from "discord.js";

export default class extends SlashCommand {
  constructor(options) {
    super(options);
    this.deployOptions.description = "Confess something to others on this server!";
    this.deployOptions.options = [
      {
        name: "message",
        description: "What do you want to confess?",
        type: 3,
        required: true
      },
      {
        name: "anon",
        description: "Do you want me to anonymize your confession? (only available on certain servers)",
        type: 5,
        required: false
      }
    ]
    this.guildonly = true;
  }
  async run(bot, interaction) {
    const data = await getConfessionConfig(interaction.guild);
    if (!data.channelID) return await interaction.reply({ content: "The server hasn't set up a confession channel yet!\nDo it with `/confessionconfig channel <channel>`", ephemeral: true });
    const user_anon = interaction.options.getBoolean("anon", false);
    if (!data.anon && user_anon) return await interaction.reply({ content: 'Sorry, the server does not accept anonymous confessions.', ephemeral: true });
    const channel = interaction.guild.channels.cache.get(data.channelID);
    if (!channel) return await interaction.reply({ content: "It seems that the channel set by the admin does not exist!\nSet the channel again with `/confessionconfig channel <channel>`", ephemeral: true })

    const embed = new EmbedBuilder()
      .setTitle("New confession")
      .setAuthor({ name: user_anon ? "Anonymous" : interaction.user.tag, iconURL: user_anon ? undefined : interaction.user.displayAvatarURL({  }) })
      .setDescription(interaction.options.getString("message", true))
      .setTimestamp()
      .setColor("Random");
    await channel.send({ embeds: [embed] });

    await interaction.reply({ content: `The confession has been sent! Check it in ${channel.toString()}`, ephemeral: true })
  }
}