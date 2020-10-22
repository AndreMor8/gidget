
import { MessageAttachment } from "discord.js";
import { getCode } from "../../utils/languages.js";

export default class extends Command {
    constructor(options) {
        super(options);
        this.description = "TTS, Text-To-Speech";
        this.permissions = {
            user: [0, 0],
            bot: [0, 32768]
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
        const reallang = getCode(lang);
        if (!reallang) return message.channel.send("Invalid language!\nhttps://github.com/AndreMor955/gidget/blob/master/src/utils/languages.js")
        const tosay = args.slice(1).join(" ");
        if (tosay.length > 200) return message.channel.send("Must be less than 200 characters")
        message.channel.startTyping();
        const att = new MessageAttachment(`https://translate.google.com/translate_tts?ie=UTF-8&total=1&idx=0&textlen=64&client=tw-ob&q=${encodeURIComponent(tosay)}&tl=${encodeURIComponent(reallang)}`, "tts.mp3");
        await message.channel.send(att).catch(() => { });
        message.channel.stopTyping(true);
    }
}