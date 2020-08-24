const { MessageEmbed } = require("discord.js");

module.exports = {
  run: async (bot, message, args) => {
    message.channel.send(new MessageEmbed()
                        .setTitle("Invite links!")
                        .setColor("#848484")
                        .setFooter("Requested by " + message.author.tag, message.author.displayAvatarURL({ dynamic: true }))
                        .addField("Invite the bot to your server", await bot.generateInvite() + "\nThanks for adding it!")
                        .addField("Support server", "https://discord.gg/KDy4gJ7")
                        .addField("Wow Wow Discord", "https://discord.gg/5qx9ZcV\nIf you are a fan of the Wubbzy series, join this server! It's managed by 4 big fans of the series :)"));
  },
  aliases: [],
  description: "Receive a link to invite the bot ;)",
  permissions: {
    user: [0, 0],
    bot: [0, 16384]
  }
}