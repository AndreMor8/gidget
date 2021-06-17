import { Util } from "discord.js";
export default class extends Command {
  constructor(options) {
    super(options);
    this.aliases = ['q'];
    this.description = "Show the queue";
    this.guildonly = true;
  }
  async run(bot, message) {
    const queue = bot.distube.getQueue(message);
    if (!queue) return message.channel.send("There is nothing playing.");
    const contents = Util.splitMessage(`**Song queue:**\n\n${queue.songs.map((song, i) => `**${parseInt(i) + 1}** ${song.name} (${song.formattedDuration})`).join(`\n`)}\n\nTotal duration: **${queue.formattedDuration}**\n\n**Now playing:** ${queue.songs[0].name} (${queue.formattedCurrentTime} / ${queue.songs[0].formattedDuration})`, { maxLength: 2000 });
    for (const content of contents) {
      await message.channel.send(content);
    }
  }
}