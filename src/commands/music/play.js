import ytpl from "@distube/ytpl";
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

    const result = (await bot.distube.search(args.slice(1).join(" "), { limit: 1, type: ytpl.validateID(args.slice(1).join(" ")) ? 'playlist' : 'video' }))[0];

    if (!result) return message.channel.send("I didn't find any video. Please try again with another term.");

    await bot.distube.playVoiceChannel(channel, result, { member: message.member, textChannel: message.channel });

    if (queue) return message.channel.send(`${result.type === "playlist" ? "Playlist: " : ""}**${result.name}** has been added to the queue!${result.type === "playlist" ? " (check g%queue for results)" : ""}`)
  }
}