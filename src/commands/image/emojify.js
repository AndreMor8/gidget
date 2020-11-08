import { MessageAttachment } from 'discord.js';
import fetch from 'node-fetch';
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
        if(!args[1] && !message.attachments.first()) return message.channel.send("Usage: emojify <url/attachment>");
        const buffer = await render(message.attachments.first() ? message.attachments.first().url : args[1]);
        const att = new MessageAttachment(buffer, "emoji.gif");
        await message.channel.send(att);
    }
}

async function render(url) {
    if(!(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()!@:%_+.~#?&//=]*)/gm.test(url))) throw new Error("Invalid URL");
    if(process.platform === "win32") {
        const Jimp = (await import("jimp")).default;
        const img = await Jimp.read(url);
        img.resize(48, 48);
        const buffer = await img.getBufferAsync(Jimp.MIME_PNG);
        return buffer;
    } else {
        const sharp = (await import("sharp")).default;
        const res = await fetch(url);
        if(!res.ok) throw new Error(`Status code returned ${res.status} (${res.statusText})`);
        const pre_buf = await res.buffer();
        const buffer = await sharp(pre_buf).resize(48, 48).png().toBuffer();
        return buffer;
    }
}