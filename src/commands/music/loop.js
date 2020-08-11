module.exports = {
  run: async (bot, message, args) => {
    if (!message.guild)
      return message.channel.send("This command only works on servers.");
    const serverQueue = message.guild.queue
    const musicVariables = message.guild.musicVariables;
    if (!message.member.voice.channel) return message.channel.send("You need to be in a voice channel to loop the music!");
    if(musicVariables && musicVariables.other) {
      if (!musicVariables.loop) {
        musicVariables.loop = true;
        return message.channel.send("🔁 The song repeat has been enabled.");
      } else {
        musicVariables.loop = false;
        return message.channel.send("🔁 The song repeat has been disabled.");
      }
    }
    if (!serverQueue || !musicVariables) return message.channel.send("There is nothing playing.");
    if (serverQueue.voiceChannel.id !== message.member.voice.channel.id)
      return message.channel.send("I'm on another voice channel!");

    if (musicVariables.inp == 1)
      return message.channel.send("I'm catching your playlist. Hang on!");

    if (!serverQueue.loop) {
      serverQueue.loop = true;
      return message.channel.send("🔁 The song repeat has been enabled.");
    } else {
      serverQueue.loop = false;
      return message.channel.send("🔁 The song repeat has been disabled.");
    }
  },
  aliases: [],
  description: "Loops the song"
};
