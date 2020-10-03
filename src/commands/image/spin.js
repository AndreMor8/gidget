const DEGREES = 30;
const SIZE = 350;
const FPS = 15;
import fetch from 'node-fetch';
import sharp from 'sharp';
import isPng from 'is-png';
import Command from '../../utils/command.js';
import parser from 'twemoji-parser';
import Canvas from 'canvas';
import GIF from "gif.node";
import { MessageAttachment, User } from 'discord.js';

export default class extends Command {
    constructor(options) {
        super(options);
        this.description = "Spin some image";
    }
    async run(message, args) {
        let source = message.attachments.first() ? (message.attachments.first().url) : (args[1] ? (message.mentions.users.first() || this.bot.users.cache.get(args[1]) || this.bot.users.cache.find(e => e.username === args.slice(1).join(" ") || e.tag === args.slice(1).join(" ")) || await this.bot.users.fetch(args[1]).catch(err => { }) || args[1]) : message.author)
        if (!source) return message.channel.send("Invalid user, emoji or image!");
        if (source instanceof User) {
            source = source.displayAvatarURL({ format: "png", size: 512 });
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
            const gif = new GIF({
                worker: 2,
                width: SIZE,
                height: SIZE,
                quality: 5
            });
            gif.on("finished", (buf) => {
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
                }
                ctx.drawImage(image, 0, 0);
                gif.addFrame(ctx.getImageData(0, 0, canvas.width, canvas.height), { delay: (1000 / FPS) });
                ctx.restore();
            }
            gif.render();
        } catch (err) {
            message.channel.send("Error: " + err);
        }
    }
}

async function resize(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Status code: " + res.status);
    const buf = await res.buffer();
    if (!isPng(buf)) throw new Error("Invalid image or the image was not PNG");
    const newbuf = await sharp(buf).resize(SIZE, SIZE).png().toBuffer();
    return newbuf;
}