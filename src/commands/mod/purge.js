module.exports = {
  run: async (bot, message = new Discord.Message(), args) => {
    if (!message.guild) return message.channel.send('This command only works on servers.')
    if (!message.channel.permissionsFor(message.member).has("MANAGE_MESSAGES")) return message.reply(`You do not have permission to execute this command.`)
    if (!message.channel.permissionsFor(message.guild.me).has("MANAGE_MESSAGES")) return message.reply("I don't have permission to delete messages :(");
    if (!args[1]) return message.reply('how many messages should I delete? Specify it.')
    let number = parseInt(args[1]);

    if (!isNaN(number) && (number <= 100) && (number >= 1)) {
      await message.delete();
      message.channel.bulkDelete(number, true).catch(err => {
        message.channel.send("Some error ocurred. Here's a debug: " + err);
      });
    } else {
      if (isNaN(number)) {
        message.channel.send('That isn\'t a number!');
      } else if (number > 100) {
        message.channel.send('I can only delete 100 messages at a time.');
      } else if (number < 1) {
        message.channel.send('I don\'t think 0 or less is what you want to delete.');
      }
    }
  },
  aliases: ["bulkdelete", "prune"],
  description: "Bulk delete messages",
}