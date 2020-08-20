const MessageModel = require("../../database/models/levelconfig");
module.exports = {
  run: async (bot, message, args) => {
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
  description: "Change if you want levels on your server or not.",
  guildonly: true,
  permissions: {
    user: [8, 0],
    bot: [0, 0]
  }
}