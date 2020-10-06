const timer = new Set();
const DEGREES = 20;
const SIZE = 340;
const FPS = 16;
import fetch from 'node-fetch';
import sharp from 'sharp';
import Command from '../../utils/command.js';
import parser from 'twemoji-parser';
import Canvas from 'canvas';
import GIF from "gif-encoder";
import { MessageAttachment, User } from 'discord.js';

export default class extends Command {
    constructor(options) {
        super(options);
        this.description = "Spin some image";
    }
    async run(message, args) {
        if(message.author.id !== "577000793094488085") {
            if(timer.has(message.author.id)) return message.channel.send("Don't overload this command (20 sec cooldown)");
            else {
                timer.add(message.author.id);
                setTimeout(() => {
                    timer.delete(message.author.id);
                }, 20000);
            }
        }
        let source = message.attachments.first() ? (message.attachments.first().url) : (args[1] ? (message.mentions.users.first() || this.bot.users.cache.get(args[1]) || this.bot.users.cache.find(e => e.username === args.slice(1).join(" ") || e.tag === args.slice(1).join(" ")) || await this.bot.users.fetch(args[1]).catch(err => { }) || args[1]) : message.author)
        if (!source) return message.channel.send("Invalid user, emoji or image!");
        if (source instanceof User) {
            source = source.displayAvatarURL({ format: "png", size: 256 });
        }
        if (source.match(/<?(a:|:)\w*:(\d{17}|\d{18})>/)) {
            const matched = source.match(/<?(a:|:)\w*:(\d{17}|\d{18})>/);
            source = `https://cdn.discordapp.com/emojis/${matched[2]}.png`;
        }
        const parsed = parser.parse(source);
        if (parsed.length >= 1) {
            source = parsed[0].url;
        }
        if (!/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()!@:%_\+.~#?&\/\/=]*)/gm.test(source)) return message.channel.send("Invalid user, emoji or image!");
        try {
            message.channel.startTyping();
            const algo = await resize(source);
            const image = await Canvas.loadImage(algo);
            const canvas = Canvas.createCanvas(SIZE, SIZE);
            const ctx = canvas.getContext("2d");
            const tempCanvas = Canvas.createCanvas(SIZE, SIZE);
            const tempCtx = tempCanvas.getContext("2d");
            canvas.width = canvas.height = tempCanvas.width = tempCanvas.height = SIZE;
            const gif = new GIF(SIZE, SIZE);
            gif.setQuality(50)
            gif.setRepeat(0);
            gif.setDelay((1000 / FPS));
            gif.setTransparent(0x00ff00);
            let chunks = [];
            gif.on("data", (b) => {
                chunks.push(b)
            });
            gif.on("end", () => {
                const buf = Buffer.concat(chunks);
                const att = new MessageAttachment(buf, "spin.gif");
                message.channel.stopTyping(true);
                message.channel.send(att);
            })
            for (let i = 0; i < parseInt(360 / DEGREES); i++) {
                tempCtx.save();
                tempCtx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = "#0f0";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                tempCtx.beginPath();
                tempCtx.arc(canvas.width / 2, canvas.height / 2, SIZE / 2, 0, 2 * Math.PI);
                tempCtx.closePath();
                tempCtx.clip();
                if (i != 0) {
                    tempCtx.translate(SIZE / 2, SIZE / 2);
                    tempCtx.rotate((DEGREES * i) * Math.PI / 180);
                    tempCtx.translate(-(SIZE / 2), -(SIZE / 2));
                } else gif.writeHeader();
                tempCtx.drawImage(image, 0, 0);
                const imgData = tempCtx.getImageData(0, 0, canvas.width, canvas.height);
                optimizeFrameColors(imgData.data);
                tempCtx.putImageData(imgData, 0, 0);
                ctx.drawImage(tempCanvas, 0, 0)
                gif.addFrame(ctx.getImageData(0, 0, canvas.width, canvas.height).data);
                tempCtx.restore();
            }
            gif.finish();
        } catch (err) {
            message.channel.send(err.toString());
        }
    }
}

/** Remove partially transparent & #00ff00 (bg color) green pixels */
function optimizeFrameColors(data) {
    for (let i = 0; i < data.length; i += 4) {
      // clamp greens to avoid pure greens from turning transparent
      data[i + 1] = data[i + 1] > 250 ? 250 : data[i + 1];
      // clamp transparency
      data[i + 3] = data[i + 3] > 127 ? 255 : 0;
    }
  }

async function resize(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Status code: " + res.status);
    const buf = await res.buffer();
    const newbuf = await sharp(buf).resize(SIZE, SIZE).png().toBuffer();
    return newbuf;
}