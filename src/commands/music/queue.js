const moment = require("moment");
require("moment-duration-format");
module.exports = {
  run: async (bot, message, args) => {
    if (!message.guild)
      return message.channel.send("This command only works on servers.");
    const serverQueue = message.guild.queue
    const musicVariables = message.guild.musicVariables;
    if (!serverQueue || !musicVariables) return message.channel.send("There is nothing playing.");
    if(!serverQueue.songs[0]) return message.channel.send("There is nothing playing.");
    if (musicVariables.inp == 1) return message.channel.send("I'm catching your playlist. Hang on!");
    let fullduration = 0;
    serverQueue.songs.forEach(e => {
      fullduration = fullduration + Number(e.duration);
    });
    message.channel.send(`**Song queue:**\n\n${serverQueue.songs.map((song, i) => `**${parseInt(i) + 1}** ${song.title} (${moment.duration(song.duration, "seconds").format()})`).join(`\n`)}\n\nTotal duration: **${moment.duration(fullduration, "seconds").format()}**\n\n**Now playing:** ${serverQueue.songs[0].title} (${moment.duration(serverQueue.connection.dispatcher.streamTime + (serverQueue.songs[0].seektime * 1000), "ms").format()} / ${moment.duration(serverQueue.songs[0].duration, "seconds").format()})`, { split: true }).catch(err => console.log(err));
  },
  aliases: [],
  description: "Show the queue"
};