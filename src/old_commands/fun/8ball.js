import Discord from 'discord.js';

export default class extends Command {
  constructor(options) {
    super(options);
    this.description = "A fun game";
    this.permissions = {
      user: [0n, 0n],
      bot: [0n, 16384n]
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

    const ballembed = new Discord.EmbedBuilder()
      .setAuthor({ name: message.author.username })
      .setColor("Random")
      .addFields([
        { name: "Question", value: args.slice(1).join(" ") },
        { name: "Answer", value: arr[Math.floor(Math.random() * arr.length)] },
      ]);

    const but_redo = new Discord.ButtonBuilder()
      .setCustomId("8ball_c_redo")
      .setStyle("Primary")
      .setLabel("Retry");

    const msg = await message.channel.send({ embeds: [ballembed], components: [new Discord.ActionRowBuilder().addComponents([but_redo])] });
    const filter = (button) => {
      if (button.user.id !== message.author.id) button.reply({ content: "Use your own instance by using `g%8ball <question>`", ephemeral: true });
      return button.user.id === message.author.id;
    };
    const col = msg.createMessageComponentCollector({ filter, idle: 15000 });
    col.on("collect", async (button) => {
      if (button.customId === "8ball_c_redo") {
        await button.update({ embeds: [ballembed.spliceFields(1, 1).addFields([{ name: "Answer", value: arr[Math.floor(Math.random() * arr.length)] }])] });
      }
    });
    col.on("end", () => msg.edit({ components: [new Discord.ActionRowBuilder().addComponents([but_redo.setDisabled(true)])] }));
  }
}