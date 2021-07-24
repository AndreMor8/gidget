import path from 'path';
import commons from '../../utils/commons.js';
import Canvas from 'canvas';
import canvasTxt from '../../utils/canvas-txt.js';
import { MessageAttachment } from 'discord.js';
const { __dirname } = commons(import.meta.url);
let image;

export default class extends Command {
  constructor(options) {
    super(options);
    this.description = 'An image of Trump where he grabs a book with your text.';
    this.permissions = {
      user: [0n, 0n],
      bot: [0n, 32768n]
    }
  }
  async run(bot, message, args) {
    if (!args[1]) return message.channel.send("Put something...");
    message.channel.startTyping();
    if (!image) image = await Canvas.loadImage(path.join(__dirname, "../../assets/Trump.png"));
    const canvas = Canvas.createCanvas(940, 709);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(image, 0, 0);
    ctx.save();
    ctx.rotate(6.3 * Math.PI / 180);
    const ctxt = new canvasTxt({ align: 'left', fontSize: 25, vAlign: 'top' });
    const { height } = ctxt.drawText(ctx, args.slice(1).join(" "), 673, 218, 240, 194);
    ctx.restore();
    if (height > 192) return message.channel.send("There is a limit of 8 lines. Your text exceeded that limit.")
    const attachment = new MessageAttachment(canvas.toBuffer(), "trump.png");
    await message.channel.send({ files: [attachment] });
    message.channel.stopTyping();
  }
}