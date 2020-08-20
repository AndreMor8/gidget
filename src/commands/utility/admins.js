const Discord = require("discord.js");

module.exports = {
  run: async (bot, message, args) => {
    const fetch = message.guild.roles.cache
      .get("402559343540568084")
      .members.map(m => m.user);
    const admins = fetch.join("\n");
    const embed = new Discord.MessageEmbed()
      .setTitle("List of Admins")
      .setDescription(admins);
    message.channel.send(embed);
  },
  aliases: [],
  onlyguild: true,
  description: "List of admins",
  permissions: {
    user: [0, 0],
    bot: [0, 16384]
  }
};
