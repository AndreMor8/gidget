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
    let real;
    const msgDocument = await MessageModel.findOne({ guildId: message.guild.id })
    if(!msgDocument) {
      const tosave = new MessageModel({
        guildId: message.guild.id,
        levelsystem: false,
        levelnotif: false,
        roles: {}
      })
      real = await tosave.save()
      bot.level.delete(message.guild.id);
    } else {
      real = msgDocument;
    }
    switch (args[1]) {
      case "notif":
        real.updateOne({ levelnotif: !real.levelnotif }).then(() => {
          message.channel.send(`Now the level-up notifications are: ${!real.levelnotif ? "Enabled" : "Disabled"}`)
          bot.level.delete(message.guild.id);
        }).catch(err => message.channel.send("Some error ocurred. Here's a debug: " + err));
      break;
      case "system": 
        real.updateOne({ levelsystem: !real.levelsystem }).then(() => {
          message.channel.send(`Now the level system is: ${!real.levelsystem ? "Enabled" : "Disabled"}`)
          bot.level.delete(message.guild.id);
        }).catch(err => message.channel.send("Some error ocurred. Here's a debug: " + err));
      break;
      default:
        message.channel.send("Invalid mode!");
    }
  },
  aliases: [],
  description: "Change if you want levels on your server or not."
}