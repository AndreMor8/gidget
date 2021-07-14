import parser from 'twemoji-parser';
import svg2img_callback from 'node-svg2img';
import { promisify } from 'util';
import { MessageAttachment } from 'discord.js';
const svg2img = promisify(svg2img_callback);
const regex = /<?(a:|:)\w*:(\d{17}|\d{18})>/;
export default class extends Command {
    constructor(options) {
        super(options);
        this.aliases = ["j"];
        this.description = "Expand some emoji :)"
    }
    async run(bot, message, args) {
        if (!args[1]) return message.channel.send("Put some emoji");
        const parsed = parser.parse(args[1]);
        const cachedemoji = message.guild?.emojis.cache.get(args[1]) || message.guild?.emojis.cache.find(e => e.name === args[1]) || bot.emojis.cache.get(args[1]) || bot.emojis.cache.find(e => e.name === args[1]);
        const matched = args[1].match(regex);
        if (matched) {
            const ext = args[1].startsWith("<a:") ? ("gif") : ("png");
            const img = `https://cdn.discordapp.com/emojis/${matched[2]}.${ext}`;
            const att = new MessageAttachment(img, matched[2] + "." + ext);
            await message.channel.send({ files: [att] });
        } else if (parsed.length >= 1) {
            const number = parseInt(args[2]);
            const size = number && ((number <= 1024) && (number > 0)) ? number : 150;
            const buf = await svg2img(parsed[0].url, { format: "png", width: size, height: size });
            const att = new MessageAttachment(buf, "twemoji.png");
            await message.channel.send({ content: (number ? undefined : "In Twemoji mode you can resize the image up to 1024.\n`jumbo <emoji> [size]`"), files: [att] });
        } else if (cachedemoji) {
            const att = new MessageAttachment(cachedemoji.url, cachedemoji.id + (cachedemoji.animated ? ".gif" : ".png"));
            await message.channel.send({ files: [att] });
        } else await message.channel.send("Please put a valid Discord custom o Twemoji/common/Unicode emoji");
    }
}