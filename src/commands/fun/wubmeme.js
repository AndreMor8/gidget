import Discord from 'discord.js';
import Jimp from 'jimp';
import path from 'path';
import commons from '../../utils/commons.js';
const { __dirname } = commons(import.meta.url);
let font;

export default class extends Command {
    constructor(options) {
        super(options);
        this.description = "Wubmeme!";
        this.permissions = {
            user: [0n, 0n],
            bot: [0n, 32768n]
        }
    }
    async run(bot, message, args) {
        if (args[1] === "64") {
            await px64(message, args.slice(2));
        } else if (args[1] === "32") {
            const arg = args.slice(2).join(" ").split(" | ");
            if (!arg[1]) return message.channel.send("Usage: `wubmeme [<32>/<64>] <text1> | <text2>`");
            if (arg[0].length > 230 || arg[1].length > 230) return message.channel.send("There's a 230 characters limit.");
            message.channel.startTyping();
            if (!font) font = await Jimp.loadFont(Jimp.FONT_SANS_64_BLACK);
            const meme = await Jimp.read(path.join(__dirname, "../../assets/wubmeme.png"));
            meme.resize(1024, 768);

            meme.print(font, 537, 20, {
                text: arg[0],
                alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
                alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE
            }, 465, 330);
            meme.print(font, 537, 410, {
                text: arg[1],
                alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
                alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE
            }, 465, 330);

            const render = await meme.getBufferAsync(Jimp.MIME_PNG);

            const attachment = new Discord.MessageAttachment(render, "wubmeme.png");
            await message.channel.send({ files: [attachment] });
            message.channel.stopTyping();
        } else {
            await px64(message, args.slice(1));
        }
    }
}

async function px64(message, args) {
    const arg = args.join(" ").split(" | ");
    if (!arg[1]) return message.channel.send("Usage: `wubmeme [<32>/<64>] <text1> | <text2>`");
    if (arg[0].length > 70 || arg[1].length > 70) return message.channel.send("There's a 70 characters limit. Put `32` before the text to expand the limit to 230.");
    message.channel.startTyping();
    if (!font) font = await Jimp.loadFont(Jimp.FONT_SANS_64_BLACK);
    const meme = await Jimp.read(path.join(__dirname, "../../assets/wubmeme.png"));
    meme.resize(1024, 768);

    meme.print(font, 526, 15, {
        text: arg[0],
        alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
        alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE
    }, 500, 360);
    meme.print(font, 526, 370, {
        text: arg[1],
        alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
        alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE
    }, 500, 430);

    const render = await meme.getBufferAsync(Jimp.MIME_PNG);

    const attachment = new Discord.MessageAttachment(render, "wubmeme.png");
    await message.channel.send({ files: [attachment] });
    message.channel.stopTyping();
}
