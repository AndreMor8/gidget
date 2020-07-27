const moment = require("moment");
const momentDurationFormatSetup = require("moment-duration-format");
module.exports = {
  run: async (bot, message, args) => {
    if (!message.guild)
      return message.channel.send("This command only works on servers.");
    const serverQueue = bot.queue.get(message.guild.id);
    const musicVariables = bot.musicVariables1.get(message.guild.id);
    if (!serverQueue) return message.channel.send("There is nothing playing.");
    if (!serverQueue.connection) return;
    if (!serverQueue.connection.dispatcher) return;
    message.channel.send(`Now playing: **${serverQueue.songs[0].title}**\nTime: ${moment.duration(serverQueue.connection.dispatcher.streamTime + (serverQueue.songs[0].seektime * 1000), "ms").format()} / ${moment.duration(serverQueue.songs[0].duration, "seconds").format()}`);
  },
  aliases: ["np"],
  description: "Shows the song that is currently playing."
};
