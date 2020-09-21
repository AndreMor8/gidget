import Command from '../../utils/command.js';
import Discord from 'discord.js';

export default class extends Command {
  constructor(options) {
    super(options);
    this.description = "A fun game";
    this.permissions = {
      user: [0, 0],
      bot: [0, 16384]
    }
  }
  async run(message, args) {
    if (!args[1]) return message.reply("Please enter a full question with 2 or more words!");

    let replies = [
      "Yes",
      "No",
      "I don't know",
      "Ask again later!",
      "Cyka",
      "I am not sure!",
      "Please No",
      "You tell me",
      "Without a doubt",
      "Cannot predict now",
    ];

    let result = Math.floor(Math.random() * replies.length);
    let question = args.slice(1).join(" ");

    let ballembed = new Discord.MessageEmbed()
      .setAuthor(message.author.username)
      .setColor("RANDOM")
      .addField("Question", question)
      .addField("Answer", replies[result]);

    message.channel.send(ballembed);
  }
}