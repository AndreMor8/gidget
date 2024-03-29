import { ButtonBuilder, ActionRowBuilder } from 'discord.js';
export default class extends Command {
  constructor(options) {
    super(options);
    this.description = "Coin flip";
  }
  async run(bot, message) {
    const arr = ["Heads", "Tails"];
    const but_redo = new ButtonBuilder()
      .setCustomId("coinflip_c_redo")
      .setStyle("Primary")
      .setLabel("Retry");
    const msg = await message.channel.send({ content: `You got: **${arr[Math.floor(Math.random() * 2)]}**!`, components: [new ActionRowBuilder().addComponents([but_redo])] });
    const filter = (button) => {
      if (button.user.id !== message.author.id) button.reply({ content: `Use your own instance by using \`${bot.user.username} coinflip\``, ephemeral: true });
      return button.user.id === message.author.id;
    };
    const col = msg.createMessageComponentCollector({ filter, idle: 15000 });
    col.on("collect", async (button) => {
      if (button.customId === "coinflip_c_redo") {
        await button.update(`You got: **${arr[Math.floor(Math.random() * 2)]}**!`);
      }
    });
    col.on("end", () => msg.edit({ content: msg.content, components: [new ActionRowBuilder().addComponents([but_redo.setDisabled(true)])] }));
  }
}