import Discord from 'discord.js';
import Canvas from 'canvas';
import svg2img_callback from 'node-svg2img';
import { promisify } from 'util';
import petpet from '../../utils/petpet.js';
import parser from 'twemoji-parser';
import isSvg from 'is-svg';
import fetch from 'node-fetch';
const svg2img = promisify(svg2img_callback);

export default class extends Command {
    constructor(options) {
        super(options);
        this.aliases = ["patpat", "pp"];
        this.description = "Pet pet";
        this.permissions = {
            user: [0n, 0n],
            bot: [0n, 32768n]
        }
    }
    async run(bot, message, args) {
        try {
            const post = args[1] ? true : (message.attachments.first() ? true : false);
            let fps = args[args.length - 1];
            if (fps.charAt(0) == '-') {
                fps = fps.substring(1);
                args.pop();
            } else {
                fps = "16";
            }
            if (fps.length > 2 || fps.length < 1) return message.channel.send("Invalid FPS. Allowable values are 2 to 60 FPS.");
            const fpsnumber = parseInt(fps);
            if (!fpsnumber) return message.channel.send("Invalid FPS. Allowable values are 2 to 60 FPS.");
            if (fpsnumber < 2 || fpsnumber > 60) return message.channel.send("Invalid FPS. Allowable values are 2 to 60 FPS.");
            const delay = parseInt(1000 / fpsnumber);
            let source = message.attachments.first() ? (message.attachments.first().url) : (args[1] ? (message.mentions.users.first() || bot.users.cache.get(args[1]) || bot.users.cache.find(e => (e.username === args.slice(1).join(" ") || e.tag === args.slice(1).join(" ") || e.username?.toLowerCase() === args.slice(1).join(" ")?.toLowerCase() || e.tag?.toLowerCase() === args.slice(1).join(" ")?.toLowerCase())) || await bot.users.fetch(args[1]).catch(() => { }) || args[1]) : message.author)
            if (!source) return message.channel.send("Invalid user, emoji or image!");
            if (source instanceof Discord.User) {
                source = source.displayAvatarURL({ format: "png", size: 128 });
            }
            if (source.match(/<?(a:|:)\w*:(\d{17}|\d{18})>/)) {
                const matched = source.match(/<?(a:|:)\w*:(\d{17}|\d{18})>/);
                source = `https://cdn.discordapp.com/emojis/${matched[2]}.png`;
            }
            const parsed = parser.parse(source);
            if (parsed.length >= 1) {
                source = parsed[0].url;
            }
            if (!/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()!@:%_+.~#?&//=]*)/gm.test(source)) return message.channel.send("Invalid user, emoji or image!");
            message.channel.startTyping();
            const res = await fetch(source);
            if(!res.ok) return message.channel.send("Status code: " + res.status);
            source = await res.buffer();
            if(isSvg(source)) {
                source = await svg2img(source, { format: "png", width: 112, height: 112 });
            }
            const torender = await Canvas.loadImage(source);
            const buf = await petpet(torender, delay);
            message.channel.stopTyping(true);
            await message.channel.send({
                content: (post ? undefined : "Usage: `petpet [user/emoji/image/attachment] [-<FPS>]`"),
                files: [{
                    attachment: buf,
                    name: "petpet.gif",
                }]
            });
        } catch (error) {
            message.channel.stopTyping(true);
         await message.channel.send("Error: " + error);
        }
    }
}
