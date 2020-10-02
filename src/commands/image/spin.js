import Command from '../../utils/command.js';
import Canvas from 'canvas';
import GIF from "gif.node";
import { MessageAttachment } from 'discord.js';

export default class extends Command {
    constructor(options) {
        super(options);
        this.description = "Spin some image";
    }
    async run(message, args) {
        const canvas = Canvas.createCanvas(512, 512);
        const ctx = canvas.getContext("2d");
        const image = await Canvas.loadImage(message.author.displayAvatarURL({ size: 512, format: "png" }));
        ctx.arc(canvas.width / 2, canvas.height / 2, 256, 0, 2 * Math.PI);
        ctx.clip();
        const gif = new GIF({
            worker: 2,
            width: 512,
            height: 512
        });
        gif.on("finished", (buf) => {
            console.log(buf.length);
            const att = new MessageAttachment(buf, "spin.gif");
            message.channel.send(att);
        })
        for (let i = 0; i < 12; i++) {
            if (i != 0) {
                ctx.translate(256, 256);
                ctx.rotate(30 * Math.PI / 180);
                ctx.translate(-256, -256);
            }
            ctx.drawImage(image, 0, 0);
            gif.addFrame(ctx.getImageData(0, 0, canvas.width, canvas.height), { copy: true, delay: (1000 / 30) })
        }
        gif.render();
    }
}