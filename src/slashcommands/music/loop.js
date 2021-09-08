export default class extends SlashCommand {
  constructor(options) {
    super(options);
    this.deployOptions.description = "Loops the song or the queue";
    this.deployOptions.options = [{
      name: "type",
      type: "INTEGER",
      description: "New mode to loop songs in this queue.",
      required: false,
      choices: [{ name: "off", value: 0 }, { name: "song", value: 1 }, { name: "queue", value: 2 }]
    }]
    this.guildonly = true;
  }
  async run(bot, interaction) {
    const channel = interaction.member.voice.channelId;
    if (!channel) return interaction.reply("You need to be in a voice channel to loop music!");
    const queue = bot.distube.getQueue(interaction.guild.me.voice);
    if (!queue) return interaction.reply(`There is nothing playing.`);
    if (queue.voiceChannel.id !== channel) return interaction.reply("You are not on the same voice channel as me.");
    let mode = interaction.options.getInteger("type");
    mode = queue.setRepeatMode(mode || (queue.repeatMode === 0 ? 1 : 0));
    mode = mode ? mode === 2 ? "Repeat queue" : "Repeat song" : "Off";
    await interaction.reply(`🔁 Set repeat mode to \`${mode}\``);
  }
}