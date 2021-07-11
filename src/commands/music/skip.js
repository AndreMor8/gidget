export default class extends Command {
  constructor(options) {
    super(options);
    this.aliases = ["jump"]
    this.description = "Skip songs";
    this.guildonly = true;
  }
  async run(bot, message, args) {

    const channel = message.member.voice.channel;
    if (!channel) return await message.channel.send("You need to be in a voice channel to pause music!");

    const queue = bot.distube.getQueue(message);
    if (!queue) return await message.channel.send(`There is nothing playing.`);
    if (queue.voiceChannel.id !== channel.id) return await message.channel.send("You are not on the same voice channel as me.");

    const to_jump = parseInt(args[1]);
    if (!to_jump && args[1]) return message.channel.send("Invalid song number.");

    if (!to_jump || to_jump === 1) {
      if (!message.member.permissions.has("MANAGE_CHANNELS")) {
        const memberRequired = Math.floor(
          ((queue.voiceChannel.members.filter(s => !s.user.bot).size) / 100) * 75
        );
        if (memberRequired > 1) {
          let memberVoted = bot.memberVotes.get(message.guild.id);
          if (!memberVoted) {
            bot.memberVotes.set(message.guild.id, []);
            memberVoted = bot.memberVotes.get(message.guild.id);
          }
          if (!memberVoted.includes(message.author.id)) {
            memberVoted.push(message.author.id);
            if (memberVoted.length < memberRequired) {
              return await message.channel.send(`Skipping? (${memberVoted.length}/${memberRequired})`);
            }
          } else {
            return await message.channel.send("You have already voted!");
          }
        }
      }
    } else {
      if (!message.member.permissions.has("MANAGE_CHANNELS")) {
        if (queue.voiceChannel.members.filter(e => !e.user.bot).size > 1) return message.channel.send("Only a member with permission to manage channels can jump to another music. Being alone also works.");
      }
    }

    if ((queue.songs.length > 1) || (to_jump < 0)) await queue.jump(to_jump || 1).catch(() => message.channel.send("Invalid song position. Check `g%queue` to see which position to jump into."));
    else queue.stop();
  }
}