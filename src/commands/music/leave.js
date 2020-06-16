module.exports = {
  run: async (bot, message, args) => {
    if (!message.guild) return message.channel.send("This command only works on servers.");
    const serverQueue = bot.queue.get(message.guild.id);
    const musicVariables = bot.musicVariables1.get(message.guild.id);
    if (!message.member.voice.channel) return message.channel.send("You need to be in a voice channel to stop music!");
    if (serverQueue) {
      if (!message.member.hasPermission("MANAGE_CHANNELS")) return message.channel.send("No!");
    if (!musicVariables)
      return message.channel.send("There is nothing playing.");
    if (musicVariables && musicVariables.other) return message.channel.send("I'm doing another operation");
    if (serverQueue.voiceChannel.id !== message.member.voice.channel.id)
      return message.channel.send("I'm on another voice channel!");
    if (!message.member.hasPermission("MANAGE_CHANNELS")) {
      if (message.member.voice.channel.members.size > 2) {
        return message.channel.send(
          "Only a member with permission to manage channels can stop queuing. Being alone also works."
        );
      }
    }
    serverQueue.songs = [];
    serverQueue.connection.dispatcher.end();
    } else {
      message.member.voice.channel.leave()
    }
  },
  aliases: [],
  description: "Stop a song"
};
