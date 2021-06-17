import { MessageAttachment } from "discord.js";
import { languages } from '@vitalets/google-translate-api';

export default class extends Command {
    constructor(options) {
        super(options);
        this.description = "TTS, Text-To-Speech";
        this.permissions = {
            user: [0n, 0n],
            bot: [0n, 32768n]
        };
    }
    async run(bot, message, args) {
        if (!args[1]) return message.channel.send("Put something");
        //Get language
        let lang = args[args.length - 1];
        if (lang.charAt(0) == '-') {
            lang = lang.substring(1);
            args.pop();
        } else {
            lang = "en"
        }
        const reallang = languages.getCode(lang);
        if (!reallang) return message.channel.send("Invalid language!\nhttps://github.com/vitalets/google-translate-api/blob/master/languages.js");
        if (!args[1]) return message.channel.send("Put something");
        const tosay = args.slice(1).join(" ");
        if (tosay.length > 200) return message.channel.send("Must be less than 200 characters")
        message.channel.startTyping();
        const att = new MessageAttachment(`https://translate.google.com/translate_tts?ie=UTF-8&total=1&idx=0&textlen=64&client=tw-ob&q=${encodeURIComponent(tosay)}&tl=${encodeURIComponent(reallang)}`, "tts.mp3");
        await message.channel.send({ files: [att] }).catch(() => { });
        message.channel.stopTyping(true);
    }
}
