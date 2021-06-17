

export default class extends Command {
  constructor(options) {
    super(options);
    this.description = "Loops the song or the queue";
    this.guildonly = true;
  }
  async run(bot, message, args) {
    const queue = bot.distube.getQueue(message);
    if (!queue) return message.channel.send(`There is nothing playing.`);
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