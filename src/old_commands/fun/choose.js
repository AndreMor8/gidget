import { ActionRowBuilder, ButtonBuilder, EmbedBuilder } from 'discord.js';

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
    const embed = new EmbedBuilder()
      .setTitle('Choose!')
      .addFields([
        { name: 'To choose', value: tochoose.join(" - ") },
        { name: 'I choose...', value: `**${tochoose[Math.floor(Math.random() * tochoose.length)]}**` },
      ])
      .setColor("Random")
      .setTimestamp();
    const but_redo = new ButtonBuilder()
      .setCustomId("choose_c_redo")
      .setStyle("Primary")
      .setLabel("Retry");
    const msg = await message.channel.send({ embeds: [embed], components: [new ActionRowBuilder().addComponents([but_redo])] });
    const filter = (button) => {
      if (button.user.id !== message.author.id) button.reply({ content: `Use your own instance by using \`@${bot.user.username} choose <response1> | <response2> | <response(n)>\``, ephemeral: true });
      return button.user.id === message.author.id;
    };
    const col = msg.createMessageComponentCollector({ filter, idle: 15000 });
    col.on("collect", async (button) => {
      if (button.customId === "choose_c_redo") {
        await button.update({ embeds: [embed.spliceFields(1, 1).addFields([{ name: "I choose...", value: `**${tochoose[Math.floor(Math.random() * tochoose.length)]}**` }])] });
      }
    });
    col.on("end", () => msg.edit({ components: [new ActionRowBuilder().addComponents([but_redo.setDisabled(true)])] }));
  }
}