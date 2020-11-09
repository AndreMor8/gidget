import { MessageAttachment } from 'discord.js';
import fetch from 'node-fetch';
import FileType from 'file-type';
import gifResize from '@gumlet/gif-resize';
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
        if(!args[1] && !message.attachments.first()) return message.channel.send("Usage: emojify <url/attachment/emoji>");
        let url;
        if(message.attachments.first()) {
            url = message.attachments.first().url;
        } else if (args[1].match(/<?(a:|:)\w*:(\d{17}|\d{18})>/)) {
            let matched = args[1].match(/<?(a:|:)\w*:(\d{17}|\d{18})>/);
            let ext = args[1].startsWith("<a:") ? ("gif") : ("png");
            url = `https://cdn.discordapp.com/emojis/${matched[2]}.${ext}`;
        } else if (/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()!@:%_+.~#?&//=]*)/gm.test(args[1])) {
            url = args[1];
        } else return message.channel.send("Invalid URL!");
        const buffer = await render(url);
        const att = new MessageAttachment(buffer, "emoji.gif");
        await message.channel.send(att);
    }
}

async function render(url) {
    const res = await fetch(url);
    if(!res.ok) throw new Error(`Status code returned ${res.status} (${res.statusText})`);
    const pre_buf = await res.buffer();
    const type = FileType(pre_buf);
    if(type.mime === "image/gif") {
        const buffer = await gifResize({ width: 48, resize_method: "sample" })(pre_buf);
        return buffer;
    } else {
        if(process.platform === "win32") {
            const Jimp = (await import("jimp")).default;
            const img = await Jimp.read(pre_buf);
            img.resize(48);
            const buffer = await img.getBufferAsync(Jimp.MIME_PNG);
            return buffer;
        } else {
            const sharp = (await import("sharp")).default;
            const buffer = await sharp(pre_buf).resize(48).png().toBuffer();
            return buffer;
        }
    }
}
