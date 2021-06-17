import moment from "moment";
import "moment-duration-format";
import { MessageEmbed } from "discord.js";

export default class extends Command {
  constructor(options) {
    super(options);
    this.aliases = ["np"];
    this.description = "Shows the song that is currently playing.";
    this.guildonly = true;
  }
  async run(bot, message) {

    const queue = bot.distube.getQueue(message);
    if (!queue) return message.channel.send("There is nothing playing.");

    const suma = moment.duration(queue.currentTime, "seconds")._milliseconds;

    const embed_success = new MessageEmbed()
      .setDescription([
        `Now playing: **[${queue.songs[0].name}](${queue.songs[0].url})**`,
        `Time: **${moment.duration(queue.currentTime, "seconds")
          .format()} / ${moment
            .duration(queue.songs[0].duration, "seconds")
            .format()}**`,
        `Progress Bar:`,
        `**${createProgressBar(
          suma,
          moment.duration(queue.songs[0].duration, "seconds")
            ._milliseconds,
          15
        )}**`,
      ].join("\n"))
      .setColor(0xffff00);
    await message.channel.send({ embeds: [embed_success] });
  }
}

function createProgressBar(current, total, size) {
  const slider = "<a:KicketyKickBallA:649698360978178061>";
  const line = "▬";
  const percentage = current / total;
  const progress = Math.round(size * percentage);
  const emptyProgress = size - progress;

  const progressText = line.repeat(progress).replace(/.$/, slider);
  const emptyProgressText = line.repeat(emptyProgress);
  const percentageText = Math.round(percentage * 100);

  const bar = `[${progressText + emptyProgressText}] ${percentageText}%`;
  return bar;
}
