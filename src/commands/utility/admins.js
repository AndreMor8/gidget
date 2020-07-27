const Discord = require("discord.js");

module.exports = {
  run: async (bot, message, args) => {
    if (message.channel.type === 'dm') return message.channel.send(`This command only works in Wow Wow Discord`);
    if (message.guild.name !== "Wow Wow Discord")
      return message.channel.send(`This command only works in Wow Wow Discord`);
    var fetch = message.guild.roles.cache
      .get("402559343540568084")
      .members.map(m => m.user);
    var admins = fetch.join("\n");
    const embed = new Discord.MessageEmbed()
      .setTitle("List of Admins")
      .setDescription(admins);
    message.channel.send(embed);
  },
  aliases: [],
  guildonly: true,
  description: "List of admins",
};
