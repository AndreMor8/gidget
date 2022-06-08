import { MessageEmbed, Util } from "discord.js";
export default class extends SlashCommand {
  constructor(options) {
    super(options);
    this.deployOptions.description = "Show the queue (adding 'previous' will show previous songs)";
    this.deployOptions.options = [{
      name: "previous",
      type: "BOOLEAN",
      description: "Do you want the previous songs?",
      required: false
    }];
    this.guildonly = true;
  }
  async run(bot, interaction) {
    const queue = bot.distube.getQueue(interaction.guild.me.voice);
    if (!queue) return await interaction.reply({ content: "There is nothing playing.", ephemeral: true });
    if (interaction.options.getBoolean("previous") && !queue.previousSongs.length) return await interaction.reply({ content: "There are no previous songs yet.", ephemeral: true })
    const contents = Util.splitMessage(interaction.options.getBoolean("previous", false) ? `${queue.previousSongs.reverse().map((song, i) => `**${parseInt(i) + 1}** ${song.name} (${song.formattedDuration})`).join(`\n`)}` : `${queue.songs.map((song, i) => `**${i}** ${song.name} (${song.formattedDuration})`).join(`\n`)}`, { maxLength: 600 });
    const embeds = [];
    for (const i in contents) {
      embeds.push(new MessageEmbed().setTitle(i == 0 ? (interaction.options.getBoolean("previous") ? "Previous songs" : "Song queue") : "").setDescription(contents[i]).setColor("RANDOM"));
      if (i == 9) break;
    }
    return await interaction.reply({ content: `Total duration: **${queue.formattedDuration}**\n\n**Now playing:** ${queue.songs[0].name} (${queue.formattedCurrentTime} / ${queue.songs[0].formattedDuration})`, embeds, ephemeral: true });
  }
}