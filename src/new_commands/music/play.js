export default class extends SlashCommand {
  constructor(options) {
    super(options);
    this.deployOptions.description = "Play music from YouTube";
    this.deployOptions.options = [{
      name: "song",
      description: "Song to play. Can be a YouTube video/playlist (URL, ID) or a search term.",
      type: "STRING",
      required: true
    }]
    this.guildonly = true;
  }
  async run(bot, interaction, song) {
    if (interaction.isCommand()) {
      const channelId = interaction.member.voice.channelId;
      if (!channelId) return interaction.reply("You need to be in a voice channel to play music!");
      if (bot.records.has(interaction.guild.id)) return interaction.reply("A recording is in progress. Wait for it to finish.");
      const channel = await interaction.guild.channels.fetch(channelId);
      const queue = bot.distube.getQueue(interaction.guild.me.voice);
      if (queue && queue.voiceChannel.id !== channel.id) return interaction.reply("You are not on the same voice channel as me.");
      if (!channel.joinable || (channel.type !== "GUILD_STAGE_VOICE" && !channel.speakable)) return interaction.reply("I don't have permissions to connect and speak in your channel!");
      const wanted = interaction.options.getString("song", true);
      await interaction.deferReply();
      await bot.distube.play(channel, wanted, { member: interaction.member, textChannel: interaction.channel, metadata: { interaction } }, true).catch(err => {
        err.message = err.message.replace("your", "my");
        return interaction.editReply(`${err}`);
      });
    } else if (interaction.isButton()) {
      const channelId = interaction.member.voice.channelId;
      if (!channelId) return interaction.editReply("You need to be in a voice channel to play music!");
      const channel = await interaction.guild.channels.fetch(channelId);
      const queue = bot.distube.getQueue(interaction.guild.me.voice);
      if (queue && queue.voiceChannel.id !== channel.id) return interaction.editReply("You are not on the same voice channel as me.");
      await bot.distube.play(channel, song, { member: interaction.member, textChannel: interaction.channel, metadata: { interaction } }, true).catch(err => {
        err.message = err.message.replace("your", "my");
        return interaction.editReply(`${err}`);
      });
    }
  }
}
