import Command from '../../utils/command.js';
import parser from 'twemoji-parser';
import svg2img_callback from 'node-svg2img';
import { promisify } from 'util';
import { MessageAttachment } from 'discord.js';
const svg2img = promisify(svg2img_callback);
export default class extends Command {
    constructor(options) {
        super(options);
        this.description = "Expand some emoji :)"
    }
    async run(message, args) {
        if (!args[1]) return message.channel.send("Put some emoji");
        let parsed = parser.parse(args[1]);
        if (args[1].match(/<?(a:|:)\w*:(\d{17}|\d{18})>/)) {
            let matched = args[1].match(/<?(a:|:)\w*:(\d{17}|\d{18})>/);
            let ext = args[1].startsWith("<a:") ? ("gif") : ("png")
            let img = `https://cdn.discordapp.com/emojis/${matched[2]}.${ext}`
            const att = new MessageAttachment(img, matched[2] + "." + ext) 
            await message.channel.send(att);
        } else if (parsed.length > 0) {
            const buf = await svg2img(parsed[0].url, { format: "png", width: 150, height: 150 });
            await message.channel.send({
                files: [{
                    attachment: buf,
                    name: "twemoji.png"
                }]
            });
        } else message.channel.send("Please put a valid Discord custom o Twemoji/common/Unicode emoji");
    }
}