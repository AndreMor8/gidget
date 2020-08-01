module.exports = {
  run: async (bot, message, args) => {
    if (!message.guild) return message.channel.send("This command only works on servers.");
    const serverQueue = bot.queue.get(message.guild.id)
    if(serverQueue && serverQueue.inseek) return;
    if (!message.member.hasPermission("MANAGE_CHANNELS") && serverQueue) return message.channel.send("I'm doing another operation");
    if (!message.member.voice.channel) return message.channel.send("You have to be in a voice channel to pause the music!");
    if (!message.member.voice.channel.joinable) return message.channel.send("I don't have permission to join that channel");
    message.member.voice.channel.join().then(() => message.channel.send("Joined!")).catch(err => message.channel.send("I couldn't join the voice channel. Here's a debug: " + err));
  },
  aliases: [],
  description: "Join a voice channel",
  secret: true,
};