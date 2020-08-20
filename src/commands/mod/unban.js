const Discord = require('discord.js');

module.exports = {
    run: async (bot, message, args) => {
      try {
        let form = await message.guild.fetchBans();
        var banInfo = await form.get(args[1]) || form.find(ban => ban.user.username == args.slice(1).join(" ")) || form.find(ban => ban.user.tag == args.slice(1).join(" "));
        if (!banInfo) {
          return message.channel.send('User not found.');
        }
      } catch (err) {
        return message.channel.send('Some error ocurred while fetching the bans. Here\'s a debug: ' + err);
      }
      try {
        await message.guild.members.unban(banInfo.user);
        message.channel.send(`I've unbanned ${banInfo.user.tag} correctly.`);
      } catch (err) {
        message.channel.send('I had an error while unbanning this user. Here\'s a debug: ' + err);
      }
    },
    aliases: [],
    description: "Unban a member from the server",
    guildonly: true,
    permissions: {
      user: [4, 0],
      bot: [4, 0]
    }
}