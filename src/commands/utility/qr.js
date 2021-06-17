const SIZE = 512
import qrenc from 'qr';
import fetch from 'node-fetch';
import Canvas from 'canvas';
import { MessageAttachment, Util } from "discord.js";
import jsQR from 'jsqr';
import isSvg from 'is-svg';
import svg2img_callback from 'node-svg2img';
import { promisify } from 'util';
const svg2img = promisify(svg2img_callback);

export default class extends Command {
  constructor(options) {
    super(options)
    this.description = "Generate a QR";
    this.permissions = {
      user: [0n, 0n],
      bot: [0n, 32768n]
    };
  }
  async run(bot, message, args) {
    if(!args[1]) return message.channel.send("Usage: `qr ['encode'] <text> [-<dot_size>]` or `qr decode [url/attachment]`");
    switch (args[1].toLowerCase()) {
      case 'decode': {
        const source = message.attachments.first() ? message.attachments.first().url : args[2];
        if(!source) return message.channel.send("Usage: `qr decode [url/attachment]`");
        if (!/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()!@:%_+.~#?&//=]*)/gm.test(source)) return message.channel.send("Invalid image or URL!");
        try {
          message.channel.startTyping();
          const buf = await resize(source);
          const image = await Canvas.loadImage(buf);
          const canvas = Canvas.createCanvas(SIZE, SIZE);
          const ctx = canvas.getContext("2d");
          ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
          const code = jsQR(ctx.getImageData(0, 0, canvas.width, canvas.height).data, canvas.width, canvas.height);
          if(code) {
            if(!code.data) return message.channel.send("I couldn't read any QR code. Try again");
            const newstr = Util.splitMessage(code.data, { limit: 2000, char: " " });
            message.channel.stopTyping(true);
         await message.channel.send("`Output:` " + newstr[0]);
          } else {
            message.channel.stopTyping(true);
         await message.channel.send("I couldn't read any QR code. Try again")
          }
        } catch (err) {
          message.channel.stopTyping(true);
       await message.channel.send(err.toString());
        }
      }
        break;
      case 'encode':
      default: {
        let dotsize = args[args.length - 1];
        if (dotsize.charAt(0) == '-') {
          dotsize = dotsize.substring(1);
          args.pop();
        } else {
          dotsize = "6";
        }
        if (isNaN(dotsize)) return message.channel.send("Only numbers allowed");
        const dot_size = parseInt(dotsize);
        if(dot_size < 1 || dot_size > 12) return message.channel.send("Invalid dot size. Allowable values are to 1 to 12");
        if(!args[1]) return message.channel.send("Usage: `qr ['encode'] <text> [-<dot_size>]` or `qr decode [url/attachment]`");
        const encoder = new qrenc.Encoder;
        encoder.on("end", (buf) => {
          const att = new MessageAttachment(buf, "qr.png");
          message.channel.stopTyping(true);
          message.channel.send({ files: [att] });
        })
        encoder.on("error", (err) => {
          message.channel.stopTyping(true);
          message.channel.send("Error when encoding QR: " + err);
        });
        message.channel.startTyping();
        encoder.encode(args.slice((args[1] === "encode" ? 2 : 1)).join(" "), null, {
          dot_size,
          margin: 1
        });
      }
    }
  }
}

async function resize(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Status code: " + res.status);
  const buf = await res.buffer();
  if(isSvg(buf)) {
    return await svg2img(buf, { format: "png", width: SIZE, height: SIZE });
  } else if (process.platform === "win32") {
      const Jimp = (await import("jimp")).default;
      const pre_buf = await Jimp.read(buf);
      pre_buf.resize(SIZE, SIZE);
      const newbuf = await pre_buf.getBufferAsync(Jimp.MIME_PNG);
      return newbuf;
  } else {
      const sharp = (await import("sharp")).default;
      const newbuf = await sharp(buf).resize(SIZE, SIZE).png().toBuffer();
      return newbuf;
  }
}