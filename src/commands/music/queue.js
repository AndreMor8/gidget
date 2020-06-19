const moment = require("moment");
const momentDurationFormatSetup = require("moment-duration-format");
module.exports = {
  run: async (bot, message, args) => {
    if (message.channel.type === "dm")
      return message.channel.send("This command only works on servers.");
    const serverQueue = bot.queue.get(message.guild.id);
    const musicVariables = bot.musicVariables1.get(message.guild.id);
    if (!serverQueue || !musicVariables) return message.channel.send("There is nothing playing.");
    if(!serverQueue.songs[0]) return message.channel.send("There is nothing playing.");
    if (musicVariables.inp == 1) return message.channel.send("I'm catching your playlist. Hang on!");
    let fullduration = 0;
    serverQueue.songs.forEach(e => {
      fullduration = fullduration + Number(e.duration);
    });
    message.channel.send(`**Song queue:**\n\n${serverQueue.songs.map(song => `**-** ${song.title} (${moment.duration(song.duration, "seconds").format()})`).join(`\n`)}\n\nTotal duration: **${moment.duration(fullduration, "seconds").format()}**\n\n**Now playing:** ${serverQueue.songs[0].title} (${moment.duration(serverQueue.connection.dispatcher.streamTime + (serverQueue.songs[0].seektime * 1000), "ms").format()} / ${moment.duration(serverQueue.songs[0].duration, "seconds").format()})`, { split: true }).catch(err => console.log(err));
  },
  aliases: [],
  description: "Show the queue"
};
