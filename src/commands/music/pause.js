export default class extends Command {
  constructor(options) {
    super(options);
    this.description = "Pause the music";
    this.guildonly = true;
  }
  async run(bot, message) {
    const channel = message.member.voice.channel;
    if (!channel) return message.channel.send("You need to be in a voice channel to pause music!");

    const queue = bot.distube.getQueue(message);
    if (!queue) return message.channel.send(`There is nothing playing.`);
    if (queue.voiceChannel.id !== channel.id) return message.channel.send("You are not on the same voice channel as me.");
    if (queue.paused) return message.channel.send("I've already paused the music.");
    if (!message.member.permissions.has("MANAGE_CHANNELS")) {
      if (queue.voiceChannel.members.filter(e => !e.user.bot).size > 1) return message.channel.send("Only a member with permission to manage channels can pause the music. Being alone also works.");
    }

    queue.pause();
    await message.channel.send("**Paused!**");
  }
}