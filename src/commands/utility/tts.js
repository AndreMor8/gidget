const { MessageAttachment } = require("discord.js");
const fetch = require("node-fetch");
const languages = require("../../utils/languages");
module.exports = {
    aliases: [],
    description: "TTS",
    permissions: {
        user: [0, 0],
        bot: [0, 32768]
    },
    run: async (bot, message, args) => {
        message.channel.startTyping();
        //Get language
        let lang = args[args.length - 1];
        if (lang.charAt(0) == '-') {
            lang = lang.substring(1);
            args.pop();
        } else {
            lang = "en"
        }
        const reallang = languages.getCode(lang);
        if(!reallang) return message.channel.send("Invalid language!\nhttps://github.com/AndreMor955/gidget/blob/master/src/utils/languages.js")
        const tosay = args.slice(1).join(" ");
        //if(tosay > 64) return message.channel.send("Must be less than 64 characters") //Going to test
        const res = await fetch(`https://translate.google.com/translate_tts?ie=UTF-8&total=1&idx=0&textlen=64&client=tw-ob&q=${tosay}&tl=${reallang}`);
        const buf = await res.buffer();
        const att = new MessageAttachment(buf, "tts.mp3");
        await message.channel.send(att);
        message.channel.stopTyping(true);
    }
}