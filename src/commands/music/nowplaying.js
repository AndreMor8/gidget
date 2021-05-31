import moment from "moment";
import "moment-duration-format";
import { MessageEmbed } from "discord.js";
import { splitBar } from "string-progressbar"; //npm i string-progressbar

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
        `Progress Bar:\n**[${
          splitBar(
            serverQueue.songs[0].duration,
            serverQueue.connection.dispatcher.streamTime +
              serverQueue.songs[0].seektime * 1000,
            15,
            "▬",
            "<a:KicketyKickBallA:649698360978178061>"
          )[0]
        }]**`,
      ])
      .setColor(0xffff00);
    await message.channel.send({ embed: embed_success });
  }
}
