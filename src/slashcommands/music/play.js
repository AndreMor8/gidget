import ytpl from "@distube/ytpl";
import { isURL } from 'distube';
import ytdl from 'ytdl-core';

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
      const channel = interaction.member.voice.channel;
      if (!channel) return interaction.reply("You need to be in a voice channel to play music!");

      const queue = bot.distube.getQueue(interaction.guild.me.voice);
      if (queue && queue.voiceChannel.id !== channel.id) return interaction.reply("You are not on the same voice channel as me.");

      if (!channel.joinable || !channel.speakable) return interaction.reply("I don't have permissions to connect and speak in your channel!");

      await interaction.defer();

      //End command execution here.
      (async () => {
        let final = null;
        const wanted = interaction.options.get("song").value;
        try {
          if ((isURL(wanted) && !ytpl.validateID(wanted)) || ytdl.validateID(wanted)) {
            const str = ytdl.validateID(wanted) ? `https://www.youtube.com/watch?v=${wanted}` : wanted;
            final = await bot.distube.handler.resolveSong(interaction.member, str);
          } else {
            final = (await bot.distube.search(wanted, { limit: 1, type: ytpl.validateID(wanted) ? 'playlist' : 'video' }))[0];
          }
          if (!final) return interaction.editReply("I didn't find any video. Please try again with another term.");
        } catch (err) {
          err.message = err.message.replace("your", "my");
          return interaction.editReply(`${err}`);
        }

        await bot.distube.playVoiceChannel(channel, final, { member: interaction.member, textChannel: interaction.channel });

        return interaction.editReply(`${final.type === "playlist" ? "Playlist:" : ""} **${final.name}** has been added to the queue! ${final.type === "playlist" ? "(check g%queue for results)" : ""}`);
      })();
    } else if (interaction.isButton()) {
      const channel = interaction.member.voice.channel;
      if (!channel) return interaction.editReply("You need to be in a voice channel to play music!");

      const queue = bot.distube.getQueue(interaction.guild.me.voice);
      if (queue && queue.voiceChannel.id !== channel.id) return interaction.editReply("You are not on the same voice channel as me.");

      await bot.distube.handler.resolveSong(interaction.member, song).then(async songObj => {
        await bot.distube.playVoiceChannel(channel, songObj, { member: interaction.member, textChannel: interaction.channel });
        return interaction.editReply(`**${songObj.name}** has been added to the queue!`);
      }).catch(err => interaction.editReply(`Error: ${err}`));
    }
  }
}