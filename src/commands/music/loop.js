

export default class extends Command {
  constructor(options) {
    super(options);
    this.description = "Loops the song or the queue";
    this.guildonly = true;
  }
  async run(bot, message, args) {
    const channel = message.member.voice.channel;
    if (!channel) return message.channel.send("You need to be in a voice channel to loop music!");
    const queue = bot.distube.getQueue(message);
    if (!queue) return message.channel.send(`There is nothing playing.`);
    if (queue.voiceChannel.id !== channel.id) return message.channel.send("You are not on the same voice channel as me.");
    let mode = null;
    switch (args[1]) {
      case "off":
      case "0":
        mode = 0
        break
      case "song":
      case "1":
        mode = 1
        break
      case "queue":
      case "2":
        mode = 2
        break
    }
    mode = queue.setRepeatMode(mode || (queue.repeatMode === 0 ? 1 : 0));
    mode = mode ? mode === 2 ? "Repeat queue" : "Repeat song" : "Off";
    await message.channel.send(`🔁 Set repeat mode to \`${mode}\`${!args[1] ? "\n\nUse: `queue <mode>`\nAvailable modes: `off`, `song`, `queue`" : ""}`);
  }
}