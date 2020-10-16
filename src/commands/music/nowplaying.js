import Command from '../../utils/command.js';
import moment from "moment";
import "moment-duration-format";

export default class extends Command {
  constructor(options) {
    super(options);
    this.aliases = ["np"];
    this.description = "Shows the song that is currently playing.";
    this.guildonly = true;
  }
  async run(bot, message, args) {
    const serverQueue = message.guild.queue
    if (!serverQueue) return message.channel.send("There is nothing playing.");
    if (!serverQueue.connection) return;
    if (!serverQueue.connection.dispatcher) return;
 await message.channel.send(`Now playing: **${serverQueue.songs[0].title}**\nTime: ${moment.duration(serverQueue.connection.dispatcher.streamTime + (serverQueue.songs[0].seektime * 1000), "ms").format()} / ${moment.duration(serverQueue.songs[0].duration, "seconds").format()}`);
  }
}
