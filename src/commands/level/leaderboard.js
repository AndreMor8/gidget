const Discord = require("discord.js");
const Levels = require("../../utils/discord-xp");
const MessageModel = require("../../database/models/levelconfig");

module.exports = {
  run: async (bot, message, args) => {
    if(!message.guild) return message.channel.send("This command only works in servers");
    const msgDocument = message.guild.cache.levelconfig ? message.guild.levelconfig : await message.guild.getLevelConfig()
    if(!msgDocument) return message.channel.send("The levels on this server are disabled! Use `togglelevel system` to enable the system!")
    if(msgDocument && !msgDocument.levelsystem) return message.channel.send("The levels on this server are disabled! Use `togglelevel system` to enable the system!")
    
    const rawLeaderboard = await Levels.fetchLeaderboard(message.guild.id, 10); // We grab top 10 users with most xp in the current server.
    if (rawLeaderboard.length < 1) return message.reply("Nobody's in leaderboard yet.");
    
    const leaderboard = Levels.computeLeaderboard(bot, rawLeaderboard); // We process the leaderboard.
    
    const lb = leaderboard.map(e => `${e.position}. ${e.mention} => **Level:** ${e.level} **XP:** ${e.xp.toLocaleString()}\n`); // We map the outputs.
    
    const embed = new Discord.MessageEmbed()
    .setTitle('Leaderboard for ' + message.guild.name)
    .setDescription(lb)
    .setColor("RANDOM")
    .setThumbnail(message.guild.iconURL({ dynamic: true }))
    .setTimestamp();
    message.channel.send(embed);
  },
  aliases: [],
  description: "Leaderboard",
  guildonly: true,
  permissions: {
    user: [0, 0],
    bot: [0, 16384]
  }
}