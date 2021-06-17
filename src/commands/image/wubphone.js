const constants = [[302.7, 420], [305.2, 325.3], [385.5, 325.3], [378, 420.8]];
import commons from '../../utils/commons.js'
const { __dirname } = commons(import.meta.url);
import path from 'path';
import Canvas from 'canvas';
import { MessageAttachment, User } from 'discord.js';

let sprite;

export default class extends Command {
    constructor(options) {
        super(options);
        this.description = "The Wubphone :)";
        this.permissions = {
            user: [0n, 0n],
            bot: [0n, 32768n]
        }
    }
    async run(bot, message, args) {
        if (!sprite) sprite = await Canvas.loadImage(path.join(__dirname + "/../../assets/wubphone.png"));
        const mentions = message.mentions.users.first(4);
        const source1 = mentions[0] || bot.users.cache.get(args[1]) || await bot.users.fetch(args[1]).catch(() => { }) || message.author;
        const source2 = mentions[1] || bot.users.cache.get(args[2]) || await bot.users.fetch(args[2]).catch(() => { });
        const source3 = mentions[2] || bot.users.cache.get(args[3]) || await bot.users.fetch(args[3]).catch(() => { });
        const source4 = mentions[3] || bot.users.cache.get(args[4]) || await bot.users.fetch(args[4]).catch(() => { });
        const sources = [source1, source2, source3, source4];
        const realsources = [];
        for (const i in sources) {
            if (sources[i] && sources[i] instanceof User) {
                realsources[i] = sources[i].displayAvatarURL({ size: 64, format: "png" });
            }
        }
        const canvasimages = [];
        for (const i in realsources) {
            canvasimages[i] = await Canvas.loadImage(realsources[i]);
        }
        const canvas = Canvas.createCanvas(1280, 720);
        const ctx = canvas.getContext("2d");
        ctx.drawImage(sprite, 0, 0)
        for (const i in canvasimages) {
            if (parseInt(i) > 3) break;
            if (i == 0) ctx.setTransform(1.4, 0, 0.465, 1, 0, 0);
            if (i == 2) ctx.setTransform(1.4, 0, 0.53, 1, 0, 0);
            ctx.drawImage(canvasimages[i], constants[i][0], constants[i][1], 62, 57.6)
        }
        const att = new MessageAttachment(canvas.toBuffer(), "algo.png");
        await message.channel.send({ content: (realsources.length <= 1 ? "Usage: `wubphone [user1] [user2] [user3] [user4]`" : undefined), files: [att] });
    }
}