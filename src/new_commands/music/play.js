import ytpl from "@distube/ytpl";
import { isURL } from 'distube';
import ytdl from '@distube/ytdl-core';

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

      await interaction.deferReply();

      //End command execution here.
      (async () => {
        let final = null;
        const wanted = interaction.options.getString("song", true);
        try {
          if ((isURL(wanted) && (!bot.distube.customPlugins[0].validate(wanted) && (!ytpl.validateID(wanted)) || ytdl.validateID(wanted)))) {
            const str = ytdl.validateID(wanted) ? `https://www.youtube.com/watch?v=${wanted}` : wanted;
            final = await bot.distube.handler.resolveSong(interaction.member, str);
          } else if (!bot.distube.customPlugins[0].validate(wanted)) {
            final = (await bot.distube.search(wanted, { limit: 1, type: ytpl.validateID(wanted) ? 'playlist' : 'video' })).catch(() => [])[0];
          }
          if (!final) {
            if (bot.distube.customPlugins[0].validate(wanted)) {
              bot.distube.customPlugins[0].play(channel, wanted, interaction.member, interaction.channel);
              return interaction.editReply('A Spotify link has been introduced...');
            }
            return interaction.editReply("I didn't find any video. Please try again with another term.");
          }
        } catch (err) {
          err.message = err.message.replace("your", "my");
          return interaction.editReply(`${err}`);
        }

        await bot.distube.playVoiceChannel(channel, final, { member: interaction.member, textChannel: interaction.channel });

        return interaction.editReply(`${final.type === "playlist" ? "Playlist:" : ""} **${final.name}** has been added to the queue! ${final.type === "playlist" ? "(check g%queue for results)" : ""}`);
      })();
    } else if (interaction.isButton()) {
      const channelId = interaction.member.voice.channelId;
      if (!channelId) return interaction.editReply("You need to be in a voice channel to play music!");
      const channel = await interaction.guild.channels.fetch(channelId);
      const queue = bot.distube.getQueue(interaction.guild.me.voice);
      if (queue && queue.voiceChannel.id !== channel.id) return interaction.editReply("You are not on the same voice channel as me.");

      await bot.distube.handler.resolveSong(interaction.member, song).then(async songObj => {
        await bot.distube.playVoiceChannel(channel, songObj, { member: interaction.member, textChannel: interaction.channel });
        return interaction.editReply(`**${songObj.name}** has been added to the queue!`);
      }).catch(err => interaction.editReply(`Error: ${err}`));
    }
  }
}