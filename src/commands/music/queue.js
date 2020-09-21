import moment from "moment";
import "moment-duration-format";
import Command from "../../utils/command.js";
export default class extends Command {
  constructor(options) {
    super(options);
    this.aliases = [];
    this.description = "Show the queue";
    this.guildonly = true;
    this.permissions = {
      user: [0, 0],
      bot: [0, 0]
    };
  }
  async run(message, args) {
    const serverQueue = message.guild.queue
    const musicVariables = message.guild.musicVariables;
    if (!serverQueue || !musicVariables) return message.channel.send("There is nothing playing.");
    if (!serverQueue.songs[0]) return message.channel.send("There is nothing playing.");
    let fullduration = 0;
    serverQueue.songs.forEach(e => {
      fullduration = fullduration + Number(e.duration);
    });
    message.channel.send(`**Song queue:**\n\n${serverQueue.songs.map((song, i) => `**${parseInt(i) + 1}** ${song.title} (${moment.duration(song.duration, "seconds").format()})`).join(`\n`)}\n\nTotal duration: **${moment.duration(fullduration, "seconds").format()}**\n\n**Now playing:** ${serverQueue.songs[0].title} (${moment.duration(serverQueue.connection.dispatcher.streamTime + (serverQueue.songs[0].seektime * 1000), "ms").format()} / ${moment.duration(serverQueue.songs[0].duration, "seconds").format()})`, { split: true }).catch(err => console.log(err));
  }
}