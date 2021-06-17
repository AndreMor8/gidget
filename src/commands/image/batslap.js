import path from 'path';
import commons from '../../utils/commons.js';
const { __dirname } = commons(import.meta.url);
import Discord from "discord.js";
import Canvas from "canvas";
let background;
export default class extends Command {
    constructor(options) {
        super(options)
        this.description = "The classic meme of Batman and Robin";
        this.permissions = {
            user: [0n, 0n],
            bot: [0n, 32768n]
        }
    }
    async run(bot, message, args) {
        const user = message.mentions.members.first() || message.guild.members.cache.get(args[1]) || message.member;
        const canvas = Canvas.createCanvas(770, 433);
        const ctx = canvas.getContext('2d');

        if (!background) background = await Canvas.loadImage(path.join(__dirname, "../../assets/Batman-Slaps-Robin.jpg"));
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

        const avatar = await Canvas.loadImage(message.author.displayAvatarURL({ format: 'png' }));

        const avatarmen = await Canvas.loadImage(user.user.displayAvatarURL({ format: 'png' }));

        ctx.drawImage(avatar, 270, 50, 160, 160);
        ctx.drawImage(avatarmen, 452, 205, 160, 160);

        const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'btslap.png');

        message.channel.send({ files: [attachment] });
    }
}
