const Discord = require('discord.js');

module.exports = {
  run: async (bot, message, args) => {
    if (message.channel.type === 'dm') return message.channel.send('This command only works on servers.')
    if (!message.member.hasPermission("MANAGE_MESSAGES")) return message.reply(`You do not have permission to execute this command.`)
    if (!message.guild.me.hasPermission("MANAGE_MESSAGES")) return message.reply("I don't have permission to delete messages :(");
    if (!args[1]) return message.reply('how many messages should I delete? Specify it.')
    var number = parseInt(args[1]);

    if (!isNaN(number) && number <= 99 && number >= 1) {
      var i = number + 1;
      message.channel.bulkDelete(i).catch(err => {
        if(err.code === 50034) return message.channel.send("The messages to be deleted are more than two weeks old! I can't delete that!")
        else message.channel.send("Some error ocurred. Here's a debug: " + err);
      });
    } else {
      if (isNaN(number) == true) {
        message.channel.send('That isn\'t a number!');
      } else if (number > 99) {
        message.channel.send('I can only delete 99 messages at a time.');
      } else if (number < 1) {
        message.channel.send('I don\'t think 0 or less is what you want to delete.');
      }
    }
  },
  aliases: ["bulkdelete"],
  description: "Bulk delete messages",
}