const { MessageEmbed } = require("discord.js");

module.exports = {
  run: async (bot, message, args) => {
    message.channel.send(new MessageEmbed()
                        .setTitle("Invite links!")
                        .setColor("#848484")
                        .setFooter("Requested by " + message.author.tag, message.author.displayAvatarURL({ dynamic: true }))
                        .addField("Invite the bot to your server", await bot.generateInvite() + "\nThanks for adding it!")
                        .addField("Support server", "Very soon! I'm waiting for the bot to grow more to make one.")
                        .addField("Wow Wow Discord", "https://discord.gg/5qx9ZcV\nIf you are a fan of the Wubbzy series, join this server! It's managed by 4 big fans of the series :)"));
  },
  aliases: [],
  description: "",
}