export default class extends Command {
  constructor(options) {
    super(options);
    this.aliases = [];
    this.description = "Change the volume dispatcher (0-100)";
    this.guildonly = true;
  }
  async run(bot, message, args) {
    const channel = message.member.voice.channel;
    if (!channel) return await message.channel.send("You need to be in a voice channel to change the volume!");

    const queue = bot.distube.getQueue(message);
    if (!queue) return await message.channel.send(`There is nothing playing.`);
    if (queue.voiceChannel.id !== channel.id) return message.channel.send("You are not on the same voice channel as me.");

    if (!args[1]) return await message.channel.send(`The current volume is: ${queue.volume}`);

    const number = parseInt(args[1]);

    if (!number) return await message.channel.send("Invalid volume!");
    if (number < 0) return await message.channel.send("Invalid volume!");
    if (number > 100) return await message.channel.send("Invalid volume!");

    queue.setVolume(number);
    await message.channel.send(`Volume set to ${number}`);
  }
}