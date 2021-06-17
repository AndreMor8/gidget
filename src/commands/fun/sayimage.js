import Discord from 'discord.js';
import algo from 'discord-emoji-canvas';
const { Canvas, fillWithEmoji } = algo;
export default class extends Command {
    constructor(options) {
        super(options);
        this.description = "Fake quote";
        this.secret = true;
        this.permissions = {
            user: [0n, 0n],
            bot: [0n, 32768n]
        };
        this.aliases = ["fakequote"];
    }
    async run(bot, message, args) {
        const miembro = message.mentions.members.first();
        if (!miembro) return message.channel.send("Mention someone");
        const mensaje = args.slice(2).join(" ");
        if (!mensaje) return message.channel.send("Put some message");

        const canvas = Canvas.createCanvas(600, 69)
        const ctx = canvas.getContext('2d')

        ctx.fillStyle = "#36393f"
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        const x = 11, y = 13, radius = 20
        ctx.save()
        ctx.beginPath()
        ctx.arc(x + radius, y + radius, radius, 0, Math.PI * 2, true)
        ctx.closePath()
        ctx.clip()

        const url = miembro.user.displayAvatarURL({ format: 'png', dynamic: false, size: 1024 })
        const image = await Canvas.loadImage(url)
        ctx.drawImage(image, x, y, radius * 2, radius * 2)

        ctx.restore()

        ctx.lineWidth = .3
        ctx.font = "14px Sans Serif"
        ctx.fillStyle = miembro.roles.color?.hexColor || '#FFF'
        ctx.strokeStyle = miembro.roles.color?.hexColor || '#FFF'
        ctx.strokeText(miembro.nickname || miembro.user.username, 66, 27)
        ctx.fillText(miembro.nickname || miembro.user.username, 66, 27)

        const largo = ctx.measureText(miembro.nickname || miembro.user.username).width
        ctx.font = "11.2px Sans Serif"
        ctx.fillStyle = "#72767d"

        let hour = Math.floor(Math.random() * 12)
        let min = Math.floor(Math.random() * 60)
        const t = ["AM", "PM"]
        const tt = t[Math.floor(Math.random() * t.length)]

        hour = (hour < 10 ? "0" : "") + hour
        min = (min < 10 ? "0" : "") + min

        ctx.fillText(`Today at ${hour}:${min} ${tt}`, 66 + largo + 8, 27);

        ctx.font = "11.2px Sans Serif"
        ctx.fillStyle = "#72767d"
        ctx.lineWidth = .1
        ctx.font = "14.5px Whitney"
        ctx.fillStyle = "#dcddde"
        await fillWithEmoji(ctx, mensaje, 66, 50)

        const attach = new Discord.MessageAttachment(canvas.toBuffer(), 'isay.png')
        await message.channel.send({ files: [attach] })
    }
}
