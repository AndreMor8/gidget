import algo from 'google-translate-open-api';
const { default: gtranslate, parseMultiple } = algo;
import { getCode } from "../../utils/languages.js";
import { MessageEmbed } from "discord.js";


export default class extends Command {
    constructor(options) {
        super(options);
        this.description = "Translate things";
        this.permissions = {
            user: [0, 0],
            bot: [0, 16384]
        };
    }
    async run(bot, message, args) {
        if (!args[1])
            return message.channel.send("Please include a message to translate!").then(m => m.delete({ timeout: 3000 }))
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

        //Get text
        let text = args.slice(1).join(" ");
        if (text.length > 700) {
            await message.channel.send("The message is too long!!").then(m => m.delete({ timeout: 3000 }))
            return;
        }

        let ptext = text;
        text = text.split(/(?=[?!.])/gi);
        text.push(" ");
        const result = await gtranslate(text, { to: reallang });
        const translated = result.data[0];
        const res = parseMultiple(translated);
        let embed = new MessageEmbed()
            .setTitle("Translate")
            .setColor("RANDOM")
            .addField('Input', `\`\`\`css\n${ptext}\`\`\``)
            .addField('Lang', `\`\`\`css\n${reallang}\`\`\``)
            .addField('Output', `\`\`\`css\n${"" + res.join(" ")}\`\`\``)
            .setTimestamp()
        await message.channel.send(embed);
    }
}