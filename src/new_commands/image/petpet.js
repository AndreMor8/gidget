import Canvas from 'canvas';
import { getBuffer } from '../../extensions.js';
import petpet from '../../utils/petpet.js';
const fpsnumber = 16;
const delay = parseInt(1000 / fpsnumber);
export default class extends SlashCommand {
  constructor(options) {
    super(options);
    this.deployOptions.name = "petpet";
    this.deployOptions.type = 2;
    this.permissions = {
      user: [0n, 0n],
      bot: [0n, 32768n]
    }
  }
  async run(bot, interaction) {
    let source = await bot.users.fetch(interaction.targetId).catch(() => { });
    if (!source) return await interaction.reply("Invalid user!");
    source = await getBuffer(source.displayAvatarURL({ extension: "png", size: 128 }));
    await interaction.deferReply();
    const torender = await Canvas.loadImage(source);
    const buf = await petpet(torender, delay);
    await interaction.editReply({
      files: [{ attachment: buf, name: "petpet.gif" }]
    });
  }
}
