const timer = new Set();
const DEGREES = 20;
const SIZE = 512;
const FPS = 20;
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
            source = source.displayAvatarURL({ format: "png", size: SIZE });
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
            const gif = new GIF(SIZE, SIZE);
            gif.setQuality(50)
            gif.setRepeat(0);
            gif.setDelay((1000 / FPS));
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
                ctx.save();
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.beginPath();
                ctx.arc(canvas.width / 2, canvas.height / 2, SIZE / 2, 0, 2 * Math.PI);
                ctx.closePath();
                ctx.clip();
                if (i != 0) {
                    ctx.translate(SIZE / 2, SIZE / 2);
                    ctx.rotate((DEGREES * i) * Math.PI / 180);
                    ctx.translate(-(SIZE / 2), -(SIZE / 2));
                } else gif.writeHeader();
                ctx.drawImage(image, 0, 0);
                gif.addFrame(ctx.getImageData(0, 0, canvas.width, canvas.height).data);
                ctx.restore();
            }
            gif.finish();
        } catch (err) {
            message.channel.send(err.toString());
        }
    }
}

async function resize(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Status code: " + res.status);
    const buf = await res.buffer();
    const newbuf = await sharp(buf).resize(SIZE, SIZE).png().toBuffer();
    return newbuf;
}