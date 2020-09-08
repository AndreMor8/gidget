module.exports = {
  run: async (bot, message, args) => {
    const serverQueue = message.guild.queue
    if (serverQueue && serverQueue.inseek) return;
    const musicVariables = message.guild.musicVariables;
    if (!message.member.voice.channel)
      return message.channel.send(
        "You need to be in a voice channel to skip music!"
      );
    if (!serverQueue)
      return message.channel.send(
        "There is nothing playing that I could skip."
      );
    if (!musicVariables)
      return message.channel.send(
        "There is nothing playing that I could skip."
      );
    if (serverQueue.voiceChannel.id !== message.member.voice.channel.id)
      return message.channel.send("I'm on another voice channel!");
    if (!message.member.hasPermission("MANAGE_CHANNELS")) {
      let memberRequired = Math.floor(
        ((message.member.voice.channel.members.filter(s => !s.user.bot).size - 1) / 100) * 75
      );
      if (memberRequired > 1) {
        if (!musicVariables.memberVoted.includes(message.author.id)) {
          musicVariables.memberVoted.push(message.author.id);
          if (musicVariables.memberVoted.length < memberRequired) {
            return message.channel.send(
              `Skipping? (${musicVariables.memberVoted.length}/${memberRequired})`
            );
          }
        } else {
          return message.channel.send("You have already voted!");
        }
      }
    }
    if (serverQueue.loop) {
      serverQueue.loop = false;
      message.channel.send("🔁 The song repeat has been disabled.");
    }
    if (!serverQueue.playing) {
      serverQueue.playing = true;
      serverQueue.connection.dispatcher.resume();
    }
    musicVariables.memberVoted = [];
    serverQueue.connection.dispatcher.end();
  },
  aliases: [],
  description: "Skip songs",
  guildonly: true,
  permissions: {
    user: [0, 0],
    bot: [0, 0]
  }
};
