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
        this.aliases = ["e", "to48px"];
        this.description = "Make a fake emoji and save it in your favorite GIFs.\nNow you can force it to PNG if you want (`g%emojify <target> -force-png`)\nSave it in your server: `g%emojify <target> -server`";
        this.permissions = {
            user: [0, 0],
            bot: [0, 32768]
        }
    }
    async run(bot, message, args) {
        const force = args.includes("-force-png");
        if (force) args.splice(args.indexOf("-force-png"), 1);
        const to_server = (args.includes("-server") && (message.guild?.me.hasPermission("MANAGE_EMOJIS") && message.member?.hasPermission("MANAGE_EMOJIS")));
        if (to_server) args.splice(args.indexOf("-server"), 1);
        if (!args[1] && !message.attachments.first()) return message.channel.send("Usage: emojify `<url/attachment/emoji> ['-force-png'] ['-server']`");
        let url;
        const user = (args[1] || message.mentions.users.first()) ? (message.mentions.users.first() || bot.users.cache.get(args[1]) || bot.users.cache.find(e => (e.username === args.slice(1).join(" ") || e.tag === args.slice(1).join(" ") || e.username?.toLowerCase() === args.slice(1).join(" ")?.toLowerCase() || e.tag?.toLowerCase() === args.slice(1).join(" ")?.toLowerCase())) || message.guild?.members.cache.find(e => (e.nickname === args.slice(1).join(" ") || e.nickname?.toLowerCase() === args.slice(1).join(" ")?.toLowerCase()))?.user || await bot.users.fetch(args[1]).catch(() => { })) : null;
        if (user) {
            url = user.displayAvatarURL({ format: "png", dynamic: true, size: 64 });
        } else if (message.attachments.first()) {
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
        const att = new MessageAttachment(buffer, `emoji.${force ? "png" : "gif"}`);
        await message.channel.send(att);
        if (to_server) {
            await message.channel.send("Tell me the name of the new emoji (30s collector time).")
            const col = message.channel.createMessageCollector((e) => e.author.id === message.author.id, { time: 30000 });
            col.on("collect", (msg) => {
                message.guild.emojis.create(buffer, msg.content, { reason: "emojify command" }).then((e) => {
                    message.channel.send(`Emoji created correctly! -> ${e.toString()}`);
                }).catch(e => {
                    message.channel.send("Error: " + e);
                }).finally(() => {
                    col.stop();
                });
            });
            col.on("end", (c, r) => {
                if (r === "time") message.channel.send("Time's up!");
            })
        }
    }
}

async function render(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Status code returned ${res.status} (${res.statusText})`);
    const pre_buf = await res.buffer();
    const type = await FileType.fromBuffer(pre_buf);
    if (type?.mime === "image/gif") {
        const buffer = await gifResize({ width: 48, interlaced: true, resize_method: "lanczos2" })(pre_buf);
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
