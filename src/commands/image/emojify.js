import { MessageAttachment } from 'discord.js';
import fetch from 'node-fetch';
import FileType from 'file-type';
import gifResize from '@gumlet/gif-resize';
import mediaExtractor from 'media-extractor';
import isSvg from 'is-svg';
import svg2img_callback from 'node-svg2img';
import { promisify } from 'util';
import parser from 'twemoji-parser';
const svg2img = promisify(svg2img_callback);

export default class extends Command {
    constructor(options) {
        super(options);
        this.description = "Make a fake emoji and save it in your favorite GIFs";
        this.permissions = {
            user: [0, 0],
            bot: [0, 32768]
        }
    }
    async run(bot, message, args) {
        if (!args[1] && !message.attachments.first()) return message.channel.send("Usage: emojify <url/attachment/emoji>");
        let url;
        if (message.attachments.first()) {
            url = message.attachments.first().url;
        } else if (args[1].match(/<?(a:|:)\w*:(\d{17}|\d{18})>/)) {
            const matched = args[1].match(/<?(a:|:)\w*:(\d{17}|\d{18})>/);
            const ext = args[1].startsWith("<a:") ? ("gif") : ("png");
            url = `https://cdn.discordapp.com/emojis/${matched[2]}.${ext}`;
        } else if ((/tenor\.com\/view/.test(args[1]) || /tenor.com\/.+\.gif/.test(args[1]) || /giphy\.com\/gifs/.test(args[1])) && await mediaExtractor.resolve(args[1])) {
            url = await mediaExtractor.resolve(args[1]);
        } else if (/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()!@:%_+.~#?&//=]*)/gm.test(args[1])) {
            url = args[1];
        }
        const parsed = parser.parse(args[1]);
        if (parsed.length >= 1) {
            url = parsed[0].url;
        }
        if (!url) return message.channel.send("Invalid URL!");
        const buffer = await render(url);
        const att = new MessageAttachment(buffer, "emoji.gif");
        await message.channel.send(att);
    }
}

async function render(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Status code returned ${res.status} (${res.statusText})`);
    const pre_buf = await res.buffer();
    const type = await FileType.fromBuffer(pre_buf);
    if (type?.mime === "image/gif") {
        const buffer = await gifResize({ width: 48 })(pre_buf);
        return buffer;
    } else if (isSvg(pre_buf)) {
        return await svg2img(pre_buf, { format: "png", width: 48, height: 48 });
    } else if (process.platform === "win32") {
        const Jimp = (await import("jimp")).default;
        const img = await Jimp.read(pre_buf);
        img.resize(48, Jimp.AUTO);
        const buffer = await img.getBufferAsync(Jimp.MIME_PNG);
        return buffer;
    } else {
        const sharp = (await import("sharp")).default;
        const buffer = await sharp(pre_buf).resize(48).png().toBuffer();
        return buffer;
    }

}
