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

    const embed_success = new MessageEmbed()
      .setDescription([
        `Now playing: **[${serverQueue.songs[0].title}](${serverQueue.songs[0].url})**`,
        `Time: ${moment
          .duration(
            serverQueue.connection.dispatcher.streamTime +
              serverQueue.songs[0].seektime * 1000,
            "ms"
          )
          .format()} / ${moment
          .duration(serverQueue.songs[0].duration, "seconds")
          .format()}`,
        `Progress Bar:`,
        `**[${
          createBar(
            serverQueue.songs[0].duration,
            serverQueue.connection.dispatcher.streamTime +
              serverQueue.songs[0].seektime * 1000
          )[0]
        }]**`,
      ])
      .setColor(0xffff00);
    await message.channel.send({ embed: embed_success });
  }
}

function createBar(
  total,
  current,
  size = 15,
  line = "▬",
  slider = "<a:KicketyKickBallA:649698360978178061>"
) {
  if (current > total) {
    const bar = line.repeat(size + 2);
    const percentage = (current / total) * 100;
    return [bar, percentage];
  } else {
    const percentage = current / total;
    const progress = Math.round(size * percentage);
    const emptyProgress = size - progress;
    const progressText = line.repeat(progress).replace(/.$/, slider);
    const emptyProgressText = line.repeat(emptyProgress);
    const bar = progressText + emptyProgressText;
    const calculated = percentage * 100;
    return [bar, calculated];
  }
}
