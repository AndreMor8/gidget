import moment from "moment";
import "moment-duration-format";
import { MessageEmbed } from "discord.js";

export default class extends SlashCommand {
  constructor(options) {
    super(options);
    this.deployOptions.description = "Shows the song that is currently playing.";
    this.guildonly = true;
  }
  async run(bot, interaction) {

    const queue = bot.distube.getQueue(interaction.guild.me.voice);
    if (!queue) return interaction.reply("There is nothing playing.");
    if (!queue.songs[0].duration) return interaction.reply({ content: `Sorry, I can't detect duration from unknown links.\nCurrent time: **${queue.formattedCurrentTime}**`, ephemeral: true })
    const suma = moment.duration(queue.currentTime, "seconds")._milliseconds;

    const embed_success = new MessageEmbed()
      .setDescription([
        `Now playing: **[${queue.songs[0].name}](${queue.songs[0].url})**`,
        `Time: **${moment.duration(queue.currentTime, "seconds").format()} / ${moment.duration(queue.songs[0].duration, "seconds").format()}**`,
        `Progress Bar:`, `**${createProgressBar(moment.duration(queue.songs[0].duration, suma, "seconds")._milliseconds, 15)}**`,
      ].join("\n"))
      .setColor(0xffff00);
    await interaction.reply({ embeds: [embed_success], ephemeral: true });
  }
}

function createProgressBar(current, total, max) {
  const percentage = current / total;
  const percentageText = Math.round(percentage * 100);
  const progress = Math.round(max * (current / total));
  const remain = max - progress;
  return `${["▬".repeat(progress), "<a:KicketyKickBallA:649698360978178061>", "▬".repeat(remain)].join("")} ${percentageText}%`
}
