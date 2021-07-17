export default class extends SlashCommand {
  constructor(options) {
    super(options);
    this.deployOptions.description = "Pause the music";
    this.guildonly = true;
  }
  async run(bot, interaction) {
    const channel = interaction.member.voice.channel;
    if (!channel) return interaction.reply("You need to be in a voice channel to pause music!");

    const queue = bot.distube.getQueue(interaction.guild.me.voice);
    if (!queue) return interaction.reply(`There is nothing playing.`);
    if (queue.voiceChannel.id !== channel.id) return interaction.reply("You are not on the same voice channel as me.");
    if (queue.paused) return interaction.reply("I've already paused the music.");
    if (!interaction.member.permissions.has("MANAGE_CHANNELS")) {
      if (queue.voiceChannel.members.filter(e => !e.user.bot).size > 1) return interaction.reply("Only a member with permission to manage channels can pause the music. Being alone also works.");
    }

    queue.pause();
    await interaction.reply("**Paused!**");
  }
}