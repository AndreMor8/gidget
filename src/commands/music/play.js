export default class extends Command {
  constructor(options) {
    super(options);
    this.aliases = ["join", "p"];
    this.description = "Play music from YouTube";
    this.guildonly = true;
  }
  async run(bot, message, args) {
    const channel = message.member.voice.channel;
    if (!channel) return message.channel.send("You need to be in a voice channel to play music!");

    const queue = bot.distube.getQueue(message);
    if (queue && queue.voiceChannel.id !== channel.id) return message.channel.send("You are not on the same voice channel as me.");

    if (!args[1]) return message.channel.send("Please enter a YouTube link or search term.");

    await bot.distube.play(message, args.slice(1).join(" "));
    if (!queue) bot.distube.setVolume(message, 100);
  }
}