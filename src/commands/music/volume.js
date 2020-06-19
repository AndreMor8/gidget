module.exports = {
  run: async (bot, message, args) => {
    if (message.channel.type === "dm")
      return message.channel.send("This command only works on servers.");
    const serverQueue = bot.queue.get(message.guild.id);
    if (serverQueue && serverQueue.inseek) return;
    const musicVariables = bot.musicVariables1.get(message.guild.id);
    if (!message.member.voice.channel)
      return message.channel.send(
        "You need to be in a voice channel to change the volume!"
      );
    if (!serverQueue) return message.channel.send("There is nothing playing.");
    if (!musicVariables) return message.channel.send("There is nothing playing.");
    if (serverQueue.voiceChannel.id !== message.member.voice.channel.id)
      return message.channel.send("I'm on another voice channel!");
    if (!args[1])
      return message.channel.send(
        `The current volume is: ${serverQueue.volume}`
      );
    if (args[1] <= 5 && args[1] >= 0) {
      serverQueue.volume = args[1];
      serverQueue.connection.dispatcher.setVolumeLogarithmic(args[1] / 5);
      return message.channel.send(`Volume set to ${args[1]}`);
    } else {
      return message.channel.send(
        "Invalid number. The allowed range is 0 to 5."
      );
    }
  },
  aliases: [],
  description: "Change the volume dispatcher"
};
