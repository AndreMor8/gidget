const Discord = require('discord.js');

module.exports = {
    run: async (bot, message, args) => {
       if (message.channel.type === 'dm') return message.channel.send('This command only works on servers.');
        if (!message.member.hasPermission("BAN_MEMBERS")) return message.reply(`you do not have permission to execute this command.`);
      if (!args[1]) return message.channel.send('Put a ~~snowflake~~ user ID to hackban them.');
      try {
        await message.guild.members.ban(args[1]);
        message.channel.send(`I've hackbanned that user.`);
      } catch (err) {
        if(err.code === 50035) return message.channel.send("Invalid ID!");
        message.channel.send(`I couldn't hackban that user. Here's a debug: ${err}`);     
      }
    },
    aliases: ['hkb'],
    description: "Ban a user who is not on the server.",
}