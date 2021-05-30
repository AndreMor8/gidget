import Discord from 'discord.js';
import { MessageButton } from 'discord-buttons';

export default class extends Command {
  constructor(options) {
    super(options);
    this.description = "A fun game";
    this.permissions = {
      user: [0, 0],
      bot: [0, 16384]
    }
  }
  async run(bot, message, args) {
    if (!args[1]) return await message.reply("Please enter a full question!");

    const arr = [
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

    const ballembed = new Discord.MessageEmbed()
      .setAuthor(message.author.username)
      .setColor("RANDOM")
      .addField("Question", args.slice(1).join(" "))
      .addField("Answer", arr[Math.floor(Math.random() * arr.length)]);

    const but_redo = new MessageButton()
      .setID("8ball_c_redo")
      .setStyle("blurple")
      .setLabel("Retry");

    const msg = await message.channel.send("", { embed: ballembed, buttons: [but_redo] });
    const filter = (button) => {
      if ((button.clicker.user?.id || button.message.channel.recipient.id) !== message.author.id) button.reply.send("Use your own instance by using `g%8ball <question>`", true);
      return (button.clicker.user?.id || button.message.channel.recipient.id) === message.author.id;
    };
    const col = msg.createButtonCollector(filter, { idle: 15000 });
    col.on("collect", async (button) => {
      await button.defer();
      if (button.id === "8ball_c_redo") {
        msg.edit("", { embed: ballembed.spliceFields(1, 1).addField("Answer", arr[Math.floor(Math.random() * arr.length)]) });
      }
    });
    col.on("end", () => {
      msg.edit("", { buttons: [but_redo.setDisabled(true)] });
    });
  }
}