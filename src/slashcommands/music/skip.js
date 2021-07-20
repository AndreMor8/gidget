export default class extends SlashCommand {
  constructor(options) {
    super(options);
    this.deployOptions.description = "Skip or jump to songs";
    this.deployOptions.options = [{
      name: "to",
      description: "Jump to a song in the queue",
      type: "STRING",
      required: false
    }]
    this.guildonly = true;
  }
  async run(bot, interaction) {

    const channel = interaction.member.voice.channel;
    if (!channel) return await interaction.reply("You need to be in a voice channel to pause music!");

    const queue = bot.distube.getQueue(interaction.guild.me.voice);
    if (!queue) return await interaction.reply(`There is nothing playing.`);
    if (queue.voiceChannel.id !== channel.id) return await interaction.reply("You are not on the same voice channel as me.");

    const to_jump = parseInt(interaction.options.get("to")?.value);
    if (!to_jump && interaction.options.get("to")) return interaction.reply("Invalid song number.");

    if (!to_jump || to_jump === 1) {
      if (!interaction.member.permissions.has("MANAGE_CHANNELS")) {
        const memberRequired = Math.floor(
          ((queue.voiceChannel.members.filter(s => !s.user.bot).size) / 100) * 75
        );
        if (memberRequired > 1) {
          let memberVoted = bot.memberVotes.get(interaction.guild.id);
          if (!memberVoted) {
            bot.memberVotes.set(interaction.guild.id, []);
            memberVoted = bot.memberVotes.get(interaction.guild.id);
          }
          if (!memberVoted.includes(interaction.user.id)) {
            memberVoted.push(interaction.user.id);
            if (memberVoted.length < memberRequired) {
              return await interaction.reply(`Skipping? (${memberVoted.length}/${memberRequired})`);
            }
          } else {
            return await interaction.reply("You have already voted!");
          }
        }
      }
    } else {
      if (!interaction.member.permissions.has("MANAGE_CHANNELS")) {
        if (queue.voiceChannel.members.filter(e => !e.user.bot).size > 1) return interaction.reply("Only a member with permission to manage channels can jump to another music. Being alone also works.");
      }
    }

    if ((queue.songs.length > 1) || (to_jump < 0)) await queue.jump(to_jump || 1).catch(() => interaction.reply("Invalid song position. Check `g%queue` to see which position to jump into."));
    else queue.stop();
    if(!interaction.replied) interaction.reply("Operation completed.");
  }
}