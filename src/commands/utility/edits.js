const Discord = require("discord.js");

module.exports = {
  run: async (bot, message, args) => {
    if(!message.guild) {
      if (!args[1]) return message.channel.send("Put a message ID");
      try {
        const channel = await bot.channels.fetch(message.channel.id);
        const msg = await channel.messages.fetch(args[1]);
        const edits = msg.edits;
        if(!edits[0]) return message.channel.send("There are no edits in that message");
        const embed = new Discord.MessageEmbed()
        .setTitle("Message Edits")
        .setDescription("This may not be perfect....")
        .setFooter("Requested by: " + message.author.tag, message.author.displayAvatarURL({ dynamic: true }))
        .setColor("BLUE")
        .addField("Message author", msg.author.tag + " (" + msg.author.id + ")");
        for (let i in edits) {
          embed.addField("Edit " + (i + 1), edits[i].content);
        }
        message.channel.send(embed);
      } catch (err) {
        message.channel.send("Some error ocurred. Here's a debug: " + err);
      }
    } else {
      if (!args[1]) return message.channel.send("Usage: edits [channel] <message>");
      try {
        let channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[1]);
        if (!channel) {
          args[2] = args[1];
          args[1] = message.channel.id;
          channel = message.channel;
        }
        const msg = await channel.messages.fetch(args[2]);
        const edits = msg.edits;
        if(!edits[0]) return message.channel.send("There are no edits in that message");
        const embed = new Discord.MessageEmbed()
        .setTitle("Message Edits")
        .setDescription("Only works with cached messages....")
        .setFooter("Requested by: " + message.author.tag, message.author.displayAvatarURL({ dynamic: true }))
        .setColor("BLUE")
        .addField("Message author", msg.author.tag + " (" + msg.author.id + ")");
        for (let i in edits) {
          embed.addField("Edit " + (parseInt(i) + 1), edits[i].content);
        }
        message.channel.send(embed);
      } catch (err) {
        message.channel.send("Some error ocurred. Here's a debug: " + err);
      }
    }
  },
  aliases: [],
  description: "See edited messages!"
}