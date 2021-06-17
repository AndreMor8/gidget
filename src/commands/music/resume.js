export default class extends Command {
  constructor(options) {
    super(options);
    this.aliases = [];
    this.description = "Resume the music";
    this.guildonly = true;
    this.permissions = {
      user: [0n, 0n],
      bot: [0n, 0n]
    };

  }
  async run(bot, message) {
    const channel = message.member.voice.channel;
    if (!channel) return message.channel.send("You need to be in a voice channel to resume music!");

    const queue = bot.distube.getQueue(message);
    if (!queue) return message.channel.send(`There is nothing playing.`);
    if (queue.voiceChannel.id !== channel.id) return message.channel.send("You are not on the same voice channel as me.");
    if (!queue.paused) return message.channel.send("Music is already playing.");
    if (!message.member.permissions.has("MANAGE_CHANNELS")) {
      if (queue.voiceChannel.members.size > 2) return message.channel.send("Only a member with permission to manage channels can resume the music. Being alone also works.");
    }

    queue.resume();
    await message.channel.send("**Resumed!**");
  }
}