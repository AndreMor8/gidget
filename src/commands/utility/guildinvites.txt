const Discord = require('discord.js');

module.exports = {
  run: async (bot, message, args) => {
    if (!message.guild) return message.channel.send('This command only works on servers.')
    if(!message.guild.me.hasPermission("MANAGE_GUILD")) return message.channel.send("I don't have permissions for that :(")
    var numberinvites;
    var mapInvites;
    try {
      const fetch = await message.guild.fetchInvites();
      numberinvites = fetch.size;
    } catch (err) {
      return message.channel.send('An error occurred while fetching the invitations. Here\'s a debug: ' + err)
    }
    if (args[1] !== "admin") {
      return message.channel.send("There are " + numberinvites + " invitations on this server.")
    } else if (args[1] === "admin") {
      if (!message.member.hasPermission("ADMINISTRATOR")) return message.reply(`You do not have permission to execute this command.`)
      try {
        const fetch = await message.guild.fetchInvites();
        mapInvites = fetch.map(i => `${i.code} (for ${i.channel} by ${i.inviter} with ${i.uses} uses)`).join("\n") || 'Without Invites';
      } catch (err) {
        return message.channel.send('An error occurred while fetching the invitations. Here\'s a debug: ' + err)
      }
      const embed = new Discord.MessageEmbed()
        .setTitle('Server Invites')
        .setDescription('There are ' + numberinvites + ' invitations on this server.\n\n**Info:**\n\n' + mapInvites)
        .setColor('#81F7F3')
      message.channel.send(embed).then(msg => msg.delete({ timeout: 7000 }).then(message.delete({ timeout: 7000 })));
    }
  },
  aliases: [],
  description: "Fetch the guild invites",
}