export default class extends SlashCommand {
  constructor(options) {
    super(options);
    this.deployOptions.description = "Resume the music";
    this.guildonly = true;
    this.permissions = {
      user: [0n, 0n],
      bot: [0n, 0n]
    };

  }
  async run(bot, interaction) {
    const channel = interaction.member.voice.channel;
    if (!channel) return interaction.reply("You need to be in a voice channel to resume music!");

    const queue = bot.distube.getQueue(interaction.guild.me.voice);
    if (!queue) return interaction.reply(`There is nothing playing.`);
    if (queue.voiceChannel.id !== channel.id) return interaction.reply("You are not on the same voice channel as me.");
    if (!queue.paused) return interaction.reply("Music is already playing.");
    if (!interaction.member.permissions.has("MANAGE_CHANNELS")) {
      if (queue.voiceChannel.members.size > 2) return interaction.reply("Only a member with permission to manage channels can resume the music. Being alone also works.");
    }

    queue.resume();
    await interaction.reply("**Resumed!**");
  }
}