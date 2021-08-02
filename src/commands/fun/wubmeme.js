import Discord from 'discord.js';
import Canvas from 'canvas';
import canvasTxt from '../../utils/canvas-txt.js';
import path from 'path';
import commons from '../../utils/commons.js';
import { isURL } from 'distube';
const { __dirname } = commons(import.meta.url);
let img;
export default class extends Command {
  constructor(options) {
    super(options);
    this.description = "Wubmeme!";
    this.permissions = {
      user: [0n, 0n],
      bot: [0n, 32768n]
    }
  }
  async run(bot, message, args) {
    try {
      const mode = ['image', 'text'].includes(args[1]) ? args[1] : undefined;
      if (mode === "text") {
        const arg = args.slice(2).join(" ").split(" | ");
        if (!arg[0] || !arg[1]) return message.channel.send("Usage: `wubmeme text <text1> | <text2>`");

        message.channel.startTyping();

        if (!img) img = await Canvas.loadImage(path.join(__dirname, "../../assets/wubmeme.png"));
        const canvas = Canvas.createCanvas(2210, 2210);
        const ctx = canvas.getContext("2d");

        ctx.drawImage(img, 0, 0);
        ctx.fillStyle = 'black';
        const ctxt = new canvasTxt({ fontSize: 110 });
        const { height: height1 } = ctxt.drawText(ctx, arg[0], 1190, 50, 960, 940);
        if (height1 > 1030) return message.channel.send("[text 1] There is a limit of 10 lines. Your text exceeded that limit.")
        const { height: height2 } = ctxt.drawText(ctx, arg[1], 1190, 1180, 960, 940);
        if (height2 > 1030) return message.channel.send("[text 2] There is a limit of 10 lines. Your text exceeded that limit.")
        const attachment = new Discord.MessageAttachment(canvas.toBuffer(), "wubmeme.png");
        await message.channel.send({ files: [attachment] });
        message.channel.stopTyping();
      } else if (mode === "image") {
        const yes = [args[2], args[3]];
        if (!yes.every(e => isURL(e))) return message.channel.send(args[2] ? "Invalid links!" : "Usage: `wubmeme image <link> <link>`");
        message.channel.startTyping();

        if (!img) img = await Canvas.loadImage(path.join(__dirname, "../../assets/wubmeme.png"));
        const canvas = Canvas.createCanvas(2210, 2210);
        const ctx = canvas.getContext("2d");

        const image1 = await Canvas.loadImage(yes[0]);
        const image2 = await Canvas.loadImage(yes[1]);

        ctx.drawImage(img, 0, 0);
        ctx.drawImage(image1, 1130, 0, 1080, 1080);
        ctx.drawImage(image2, 1130, 1131, 1080, 1079);

        const attachment = new Discord.MessageAttachment(canvas.toBuffer(), "wubmeme.png");
        await message.channel.send({ files: [attachment] });
        message.channel.stopTyping();
      } else message.channel.send("Use: `wubmeme <mode> <...args>`\nAvailable modes: `text`, `image`")
    } catch (err) {
      message.channel.stopTyping();
      message.channel.send(`Error: ${err}`);
    }
  }
}