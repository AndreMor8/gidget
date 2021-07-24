import { join } from 'path';
import commons from '../../utils/commons.js';
import { MessageAttachment } from 'discord.js';
import Canvas from 'canvas';
import canvasTxt from '../../utils/canvas-txt.js';
const { __dirname } = commons(import.meta.url);
Canvas.registerFont(join(__dirname, "..", "..", "assets", "HouseHolidaySans.otf"), { family: "hhs" });
const WIDTH = 1024;
const HEIGHT = 768;

export default class extends Command {
  constructor(options) {
    super(options);
    this.description = "Generate a text with the `House Holiday Sans` font, the font that some Wubbzy products and pages used.";
    this.permissions = {
      user: [0n, 0n],
      bot: [0n, 32768n]
    }
  }
  async run(bot, message, args) {
    if (!args[1]) return message.channel.send("Put something");
    const text = args.slice(1).join(" ")
    message.channel.startTyping();
    const canvas = Canvas.createCanvas(WIDTH, HEIGHT);
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = '#2E3192';
    const ctxt = new canvasTxt({ font: 'hhs', fontSize: 130, fontStyle: '#2E3192' })
    ctx.shadowBlur = 3;
    ctx.shadowColor = "white";
    const { height } = ctxt.drawText(ctx, text, 0, 0, WIDTH, HEIGHT, false);
    if (height > 665) return message.channel.send("There is a limit of 7 lines. Your text exceeded that limit");
    ctx.strokeStyle = "white";
    ctxt.drawText(ctx, text, 0, 0, WIDTH, HEIGHT, true);
    const att = new MessageAttachment(canvas.toBuffer(), "wubbtext.png");
    await message.channel.send({ files: [att] });
  }
}