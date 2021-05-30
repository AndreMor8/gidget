import Discord from 'discord.js';
import { MessageButton } from 'discord-buttons';

export default class extends Command {
  constructor(options) {
    super(options);
    this.description = "Random choose";
    this.permissions = {
      user: [0, 0],
      bot: [0, 16384]
    }
  }
  async run(bot, message, args) {
    const form = args.slice(1).join(" ");
    const tochoose = form.split(" | ")
    if(!tochoose[0] || !tochoose[1]) return message.channel.send('Usage: `choose <response1> | <response2> | <response(n)>`')
    const embed = new Discord.MessageEmbed()
    .setTitle('Choose!')
    .addField('To choose', tochoose.join(" - "))
    .addField('I choose...', `**${tochoose[Math.floor(Math.random() * tochoose.length)]}**`)
    .setColor("RANDOM")
    .setTimestamp();
    const but_redo = new MessageButton()
      .setID("choose_c_redo")
      .setStyle("blurple")
      .setLabel("Retry");
    const msg = await message.channel.send("", { embed, buttons: [but_redo] });
    const filter = (button) => {
      if ((button.clicker.user?.id || button.message.channel.recipient?.id) !== message.author.id) button.reply.send("Use your own instance by using `g%choose <response1> | <response2> | <response(n)>`", true);
      return (button.clicker.user?.id || button.message.channel.recipient?.id) === message.author.id;
    };
    const col = msg.createButtonCollector(filter, { idle: 15000 });
    col.on("collect", async (button) => {
      await button.defer();
      if (button.id === "choose_c_redo") {
        msg.edit("", { embed: embed.spliceFields(1, 1).addField("I choose...", tochoose[Math.floor(Math.random() * tochoose.length)]) });
      }
    });
    col.on("end", () => {
      msg.edit("", { buttons: [but_redo.setDisabled(true)] });
    });
  }
}