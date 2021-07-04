import { MessageActionRow, MessageButton, MessageEmbed } from 'discord.js';

export default class extends Command {
  constructor(options) {
    super(options);
    this.description = "Random choose";
    this.permissions = {
      user: [0n, 0n],
      bot: [0n, 16384n]
    }
  }
  async run(bot, message, args) {
    const form = args.slice(1).join(" ");
    const tochoose = form.split(" | ")
    if (!tochoose[0] || !tochoose[1]) return message.channel.send('Usage: `choose <response1> | <response2> | <response(n)>`')
    const embed = new MessageEmbed()
      .setTitle('Choose!')
      .addField('To choose', tochoose.join(" - "))
      .addField('I choose...', `**${tochoose[Math.floor(Math.random() * tochoose.length)]}**`)
      .setColor("RANDOM")
      .setTimestamp();
    const but_redo = new MessageButton()
      .setCustomID("choose_c_redo")
      .setStyle("PRIMARY")
      .setLabel("Retry");
    const msg = await message.channel.send({ embeds: [embed], components: [new MessageActionRow().addComponents([but_redo])] });
    const filter = (button) => {
      if (button.user.id !== message.author.id) button.reply({ content: "Use your own instance by using `g%choose <response1> | <response2> | <response(n)>`", ephemeral: true });
      return button.user.id === message.author.id;
    };
    const col = msg.createMessageComponentInteractionCollector({ filter, idle: 15000 });
    col.on("collect", async (button) => {
      if (button.customID === "choose_c_redo") {
        await button.update({ embeds: [embed.spliceFields(1, 1).addField("I choose...", `**${tochoose[Math.floor(Math.random() * tochoose.length)]}**`)] });
      }
    });
    col.on("end", () => {
      msg.edit({ components: [new MessageActionRow().addComponents([but_redo.setDisabled(true)])] });
    });
  }
}