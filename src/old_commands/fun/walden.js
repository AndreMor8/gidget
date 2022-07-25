import path from 'path';
import commons from '../../utils/commons.js';
import Discord from 'discord.js';
import Canvas from 'canvas';
import canvasTxt from '../../utils/canvas-txt.js';
import { isURL } from '../../extensions.js';

const { __dirname } = commons(import.meta.url);
let image;

export default class extends Command {
  constructor(options) {
    super(options);
    this.description = "Walden";
    this.permissions = {
      user: [0n, 0n],
      bot: [0n, 32768n]
    }
  }
  async run(bot, message, args) {
    try {
      const mode = ['image', 'text'].includes(args[1]) ? args[1] : undefined;

      if (mode === "text") {
        const text = args.slice(2).join(" ");
        if (!text) return message.channel.send("Usage: `walden text <text>`");
        message.channel.sendTyping();
        if (!image) image = await Canvas.loadImage(path.join(__dirname, "../../assets/walden-says.png"));
        const canvas = Canvas.createCanvas(854, 450);
        const ctx = canvas.getContext("2d");
        ctx.drawImage(image, 0, 0);
        ctx.fillStyle = "black";
        const ctxt = new canvasTxt({ fontSize: 27 });
        const { height } = ctxt.drawText(ctx, text, 400, 43, 271, 195);
        if (height > 182) return message.channel.send("There is a limit of 7 lines. Your text exceeded that limit.")
        const attachment = new Discord.AttachmentBuilder(canvas.toBuffer(), { name: "walden.png" });
        await message.channel.send({ files: [attachment] });
        
      } else if (mode === "image") {
        const ok = message.attachments.first()?.url || (isURL(args[2]) ? args[2] : undefined);
        if (!ok) return message.channel.send("Usage: `walden image <link/attachment>`");
        message.channel.sendTyping();
        if (!image) image = await Canvas.loadImage(path.join(__dirname, "../../assets/walden-says.png"));
        const canvas = Canvas.createCanvas(854, 450);
        const ctx = canvas.getContext("2d");
        ctx.drawImage(image, 0, 0);
        const userImage = await Canvas.loadImage(ok);
        roundRectAndDraw(ctx, 402.7, 49.5, 265, 188.4, 36.5, 11, userImage);
        const attachment = new Discord.AttachmentBuilder(canvas.toBuffer(), { name: "walden.png" });
        await message.channel.send({ files: [attachment] });
        

      } else return message.channel.send("Usage: `walden <mode> <arg>`\nAvailable modes: `text`, `image`");
    } catch (err) {
      
      message.channel.send(`Error: ${err}`);
    }
  }
}

function roundRectAndDraw(ctx, x, y, width, height, radius, line, image) {
  if (typeof radius === "undefined") {
    radius = 5;
  }
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.lineWidth = line;
  ctx.stroke();
  ctx.clip();
  if (image) ctx.drawImage(image, x, y, width, height);
  ctx.lineWidth = 1;
  ctx.closePath();
  ctx.restore();
}