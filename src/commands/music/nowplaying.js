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
    const serverQueue = message.guild.queue;
    if (!serverQueue) return message.channel.send("There is nothing playing.");
    if (!serverQueue.connection) return;
    if (!serverQueue.connection.dispatcher) return;

    const suma = moment.duration(
      serverQueue.connection.dispatcher.streamTime +
        serverQueue.songs[0].seektime * 1000,
      "ms"
    )._milliseconds;

    const embed_success = new MessageEmbed()
      .setDescription([
        `Now playing: **[${serverQueue.songs[0].title}](${serverQueue.songs[0].url})**`,
        `Time: **${moment
          .duration(
            serverQueue.connection.dispatcher.streamTime +
              serverQueue.songs[0].seektime * 1000,
            "ms"
          )
          .format()} / ${moment
          .duration(serverQueue.songs[0].duration, "seconds")
          .format()}**`,
        `Progress Bar:`,
        `**${createProgressBar(
          suma,
          moment.duration(serverQueue.songs[0].duration, "seconds")
            ._milliseconds,
          15
        )}**`,
      ])
      .setColor(0xffff00);
    await message.channel.send({ embed: embed_success });
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
