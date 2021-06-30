import { MessageAttachment, MessageButton, MessageActionRow } from 'discord.js';
import fetch from 'node-fetch';
import FileType from 'file-type';
import gifResize from '../../utils/gifresize.js';
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
        this.description = "Make a fake emoji and save it in your favorite GIFs.\nNow you can force it to PNG if you want (`g%emojify <target> -force-png`)\nSave it in your server with a button ;)";
        this.permissions = {
            user: [0n, 0n],
            bot: [0n, 32768n]
        }
    }
    async run(bot, message, args) {
        const force = args.includes("-force-png");
        if (force) args.splice(args.indexOf("-force-png"), 1);
        if (!args[1] && !message.attachments.first()) return message.channel.send("Usage: `emojify <url/attachment/emoji> ['-force-png']`");
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
        const { pre_type, buffer } = await render(url);

        const but_add = new MessageButton()
            .setStyle("PRIMARY")
            .setCustomID("emojify_c_add2sv")
            .setLabel("Add to server")
            .setDisabled(!(message.guild?.me.permissions.has("MANAGE_EMOJIS") && message.member?.permissions.has("MANAGE_EMOJIS")));

        const att = new MessageAttachment(buffer, `emoji.${force ? "png" : "gif"}`);
        const filter = (button) => {
            if (button.user.id !== message.author.id) button.reply({ content: "You are not authorized", ephemeral: true });
            return button.user.id === message.author.id;
        };
        const here = await message.channel.send({ files: [att], components: [new MessageActionRow().addComponents([but_add])] });

        if (!but_add.disabled) {
            const butcol = here.createMessageComponentInteractionCollector({ filter, idle: 60000 });
            butcol.on("collect", async (button) => {
                if (!(message.guild?.me.permissions.has("MANAGE_EMOJIS") && message.member?.permissions.has("MANAGE_EMOJIS"))) return button.reply("Nope", true);
                await button.reply("Tell me the name of the new emoji (30s collector time).");
                butcol.stop("a");
                here.edit({ components: [new MessageActionRow().addComponents([but_add.setDisabled(true)])] });
                const col = message.channel.createMessageCollector({ filter: (e) => e.author.id === message.author.id, time: 30000 });
                col.on("collect", (msg) => {
                    message.guild.emojis.create((pre_type == "svg") ? buffer : url, msg.content, { reason: "emojify command" }).then((e) => {
                        button.editReply(`Emoji created correctly! -> ${e.toString()}`);
                    }).catch(e => {
                        button.editReply("Error: " + e);
                    }).finally(() => {
                        msg.delete();
                        col.stop();
                    });
                });
                col.on("end", (c, r) => {
                    if (r === "time") button.editReply("Time's up!");
                });
            });
            butcol.on("end", (c, r) => {
                if (r === "idle") here.edit({ components: [new MessageActionRow().addComponents([but_add.setDisabled(true)])] });
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
        const buffer = await gifResize({ width: 48, interlaced: true })(pre_buf);
        return { pre_type: "gif", buffer };
    } else if (isSvg(pre_buf)) {
        return { pre_type: "svg", buffer: await svg2img(pre_buf, { format: "png", width: 48, height: 48 }) };
    } else if (process.platform === "win32") {
        const Jimp = (await import("jimp")).default;
        const img = await Jimp.read(pre_buf);
        img.resize(48, Jimp.AUTO);
        const buffer = await img.getBufferAsync(Jimp.MIME_PNG);
        return { pre_type: "image", buffer };
    } else {
        const sharp = (await import("sharp")).default;
        const buffer = await sharp(pre_buf).resize(48).png().toBuffer();
        return { pre_type: "image", buffer };
    }
}
