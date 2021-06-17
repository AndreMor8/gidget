export default class extends Command {
  constructor(options) {
    super(options);
    this.aliases = ["leave", "end"];
    this.description = "Stop the queue";
    this.guildonly = true;
  }
  // eslint-disable-next-line require-await
  async run(bot, message) {
    const channel = message.member.voice.channel;
    if (!channel) return message.channel.send("You need to be in a voice channel to stop music!");

    const queue = bot.distube.getQueue(message);
    if (!queue) return message.channel.send(`There is nothing playing.`);
    if (queue.voiceChannel.id !== channel.id) return message.channel.send("You are not on the same voice channel as me.");
    if (!message.member.permissions.has("MANAGE_CHANNELS")) {
      if (queue.voiceChannel.members.filter(e => !e.user.bot).size > 1) return message.channel.send("Only a member with permission to manage channels can stop the music. Being alone also works.");
    }
    queue.stop();
  }
}
