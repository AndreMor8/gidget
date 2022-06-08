export default class extends SlashCommand {
  constructor(options) {
    super(options);
    this.aliases = [];
    this.deployOptions.description = "Change or see the volume dispatcher (0-100)";
    this.deployOptions.options = [{
      name: "volume",
      type: "INTEGER",
      description: "New value for volume",
      required: false,
      minValue: 0,
      maxValue: 100
    }]
    this.guildonly = true;
  }
  async run(bot, interaction) {
    const channel = interaction.member.voice.channelId;
    if (!channel) return await interaction.reply("You need to be in a voice channel to change the volume!");

    const queue = bot.distube.getQueue(interaction.guild.me.voice);
    if (!queue) return await interaction.reply(`There is nothing playing.`);
    if (queue.voiceChannel.id !== channel) return await interaction.reply("You are not on the same voice channel as me.");
    if (!interaction.options.getInteger("volume", false)) return await interaction.reply(`The current volume is: ${queue.volume}`);

    const number = interaction.options.getInteger("volume", false);

    queue.setVolume(number);
    await interaction.reply(`Volume set to ${number}`);
  }
}