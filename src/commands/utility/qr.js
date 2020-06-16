const Discord = require("discord.js")

module.exports = {
  run: async (bot, message, args) => {
    let text = args.slice(1).join(" ");
    if(!text) {
      return message.channel.send("Put some text!");
    }
    message.channel.startTyping();
    
    message.channel.send(new Discord.MessageAttachment(`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${text.replace(new RegExp(" ", "g"), "%20")}`, 'qr.png')).then(() => message.channel.stopTyping())
  },
  aliases: [],
  description: "Generate a QR"
}