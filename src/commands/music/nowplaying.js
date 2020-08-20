const moment = require("moment");
require("moment-duration-format");
module.exports = {
  run: async (bot, message, args) => {
    const serverQueue = message.guild.queue
    const musicVariables = message.guild.musicVariables;
    if (!serverQueue) return message.channel.send("There is nothing playing.");
    if (!serverQueue.connection) return;
    if (!serverQueue.connection.dispatcher) return;
    message.channel.send(`Now playing: **${serverQueue.songs[0].title}**\nTime: ${moment.duration(serverQueue.connection.dispatcher.streamTime + (serverQueue.songs[0].seektime * 1000), "ms").format()} / ${moment.duration(serverQueue.songs[0].duration, "seconds").format()}`);
  },
  aliases: ["np"],
  description: "Shows the song that is currently playing.",
  guildonly: true,
  permissions: {
    user: [0, 0],
    bot: [0, 0]
  }
};
