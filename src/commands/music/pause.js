module.exports = {
  run: async (bot, message, args) => {
    if (!message.guild) return message.channel.send("This command only works on servers.");
    const serverQueue = bot.queue.get(message.guild.id);
    if (serverQueue && serverQueue.inseek) return;
    const musicVariables = bot.musicVariables1.get(message.guild.id);
    if (!message.member.voice.channel) return message.channel.send("You have to be in a voice channel to pause the music!");
    if (!serverQueue || !musicVariables) return message.channel.send("There is no song that I could pause!");
    if (serverQueue.voiceChannel.id !== message.member.voice.channel.id) return message.channel.send("I'm on another voice channel!");
    if (!message.member.hasPermission("MANAGE_CHANNELS")) {
      if (message.member.voice.channel.members.size > 2) {
        return message.channel.send("Only a member with permission to manage channels can pause the music. Being alone also works.");
      }
    }
    if (!serverQueue.playing) return message.channel.send(`I've already paused the music.`);
    serverQueue.playing = false;
    serverQueue.connection.dispatcher.pause();
    return message.channel.send(`**Paused!**`);
  },
  aliases: [],
  description: "Pause the music"
};