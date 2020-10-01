import Discord from 'discord.js';
import Canvas from 'canvas';
import Command from '../../utils/command.js';
import petpet from '../../utils/petpet.js';
import parser from 'twemoji-parser';

export default class extends Command {
    constructor(options) {
        super(options);
        this.description = "Pet pet";
        this.permissions = {
            user: [0, 0],
            bot: [0, 32768]
        }
    }
    async run(message, args) {
        try {
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
            let source = message.attachments.first() ? (message.attachments.first().url) : (args[1] ? (message.mentions.users.first() || this.bot.users.cache.get(args[1]) || this.bot.users.cache.find(e => e.username === args.slice(1).join(" ") || e.tag === args.slice(1).join(" ")) || await this.bot.users.fetch(args[1]).catch(err => { }) || args[1]) : message.author)
            if (!source) return message.channel.send("Invalid user, emoji or image!");
            if (source instanceof Discord.User) {
                source = source.displayAvatarURL({ format: "png", size: 128 });
            }
            if(source.match(/<?(a:|:)\w*:(\d{17}|\d{18})>/)) {
                const matched = source.match(/<?(a:|:)\w*:(\d{17}|\d{18})>/);
                source = `https://cdn.discordapp.com/emojis/${matched[2]}.png`;
            }
            const parsed = parser.parse(source);
            if(parsed.length >= 1) {
                source = parsed[0].url;
            }
            if (!/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()!@:%_\+.~#?&\/\/=]*)/gm.test(source)) return message.channel.send("Invalid user, emoji or image!");
            message.channel.startTyping();
            const torender = await Canvas.loadImage(source);
            const buf = await petpet(torender, delay);
            message.channel.stopTyping(true);
            await message.channel.send({
                files: [{
                    attachment: buf,
                    name: "petpet.gif",
                }]
            });
        } catch (error) {
            message.channel.stopTyping(true);
            message.channel.send("Error: " + error);
        }
    }
}