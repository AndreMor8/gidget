const Discord = require('discord.js');

module.exports = {
    run: async (bot, message, args) => {
      const fetch = message.guild.roles.cache.get('617518093480230912').members.map(m => m.user);
      const mods = fetch.join('\n');
      const embed = new Discord.MessageEmbed()
      .setTitle('List of Mods')
      .setDescription(mods)
      message.channel.send(embed);
    },
    aliases: [],
    onlyguild: true,
    description: "List of Mods",
    permissions: {
      user: [0, 0],
      bot: [0, 16384]
    }
}