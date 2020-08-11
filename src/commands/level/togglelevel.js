const MessageModel = require("../../database/models/levelconfig");
module.exports = {
  run: async (bot, message, args) => {
    if(!message.guild) return message.channel.send("This command only works in servers");
    if(!message.member.hasPermission("ADMINISTRATOR")){
      if(message.guild.id === "312846399731662850" && message.author.id !== "577000793094488085") {
        return message.channel.send("You do not have permission to use this command!");
      }
    }
    if (!args[1]) return message.channel.send("Usage: `togglelevel <system/notif>`");
    const reference = message.guild.cache.levelconfig ? message.guild.levelconfig : await message.guild.getLevelConfig();
    switch (args[1]) {
      case "notif":
        await message.guild.changeLevelConfig("levelnotif", !reference.levelnotif)
        message.channel.send(`Now the level-up notifications are: ${!reference.levelsystem ? "Enabled" : "Disabled"}`)
      break;
      case "system": 
        await message.guild.changeLevelConfig("levelsystem", !reference.levelsystem)
        message.channel.send(`Now the level system is: ${!reference.levelsystem ? "Enabled" : "Disabled"}`)
      break;
      default:
        message.channel.send("Invalid mode!");
    }
  },
  aliases: [],
  description: "Change if you want levels on your server or not."
}