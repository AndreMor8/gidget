import Command from "../../utils/command.js";

export default class extends Command {
  constructor(options) {
    super(options);
    this.aliases = [];
    this.description = "Resume the music";
    this.guildonly = true;
    this.permissions = {
      user: [0, 0],
      bot: [0, 0]
    };

  }
  async run(message, args) {
    const serverQueue = message.guild.queue
    if (!serverQueue) return message.channel.send("There is nothing playing.");
    if (serverQueue && serverQueue.inseek) return;
    const musicVariables = message.guild.musicVariables;
    if (!musicVariables)
      return message.channel.send("There is nothing playing.");
    if (!message.member.voice.channel)
      return message.channel.send(
        "You have to be in a voice channel to resume the music!"
      );
    if (!serverQueue)
      return message.channel.send("There is no song that I could resume!");
    if (serverQueue.voiceChannel.id !== message.member.voice.channel.id)
      return message.channel.send("I'm on another voice channel!");
    if (serverQueue.playing)
      return message.channel.send(`The music isn't paused.`);
    if (!message.member.hasPermission("MANAGE_CHANNELS")) {
      if (message.member.voice.channel.members.size > 2) {
        return message.channel.send(
          "Only a member with permission to manage channels can resume the music. Being alone also works."
        );
      }
    }
    serverQueue.playing = true;
    serverQueue.connection.dispatcher.resume();
    return message.channel.send("**Resuming!**");
  }
}