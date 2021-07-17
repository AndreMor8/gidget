export default class extends SlashCommand {
  constructor(options) {
    super(options);
    this.deployOptions.description = "Stop the queue";
    this.guildonly = true;
  }
  // eslint-disable-next-line require-await
  async run(bot, interaction) {
    const channel = interaction.member.voice.channel;
    if (!channel) return interaction.reply("You need to be in a voice channel to stop music!");

    const queue = bot.distube.getQueue(interaction.guild.me.voice);
    if (!queue) return interaction.reply(`There is nothing playing.`);
    if (queue.voiceChannel.id !== channel.id) return interaction.reply("You are not on the same voice channel as me.");
    if (!interaction.member.permissions.has("MANAGE_CHANNELS")) {
      if (queue.voiceChannel.members.filter(e => !e.user.bot).size > 1) return interaction.reply("Only a member with permission to manage channels can stop the music. Being alone also works.");
    }
    queue.stop();
    interaction.reply("Operation completed.");
  }
}
