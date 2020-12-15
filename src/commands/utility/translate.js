import { default as gtranslate, languages } from '@vkedwardli/google-translate-api';
const { getCode } = languages;
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
        const text = args.slice(1).join(" ");
        if (text.length > 700) {
            await message.channel.send("The message is too long!!").then(m => m.delete({ timeout: 3000 }))
            return;
        }
        const result = await gtranslate(text, { to: reallang });
        const embed = new MessageEmbed()
            .setTitle("Translate")
            .setColor("RANDOM")
            .addField('Input', `\`\`\`css\n${text}\`\`\``)
            .addField('Lang', `\`\`\`css\n${reallang}\`\`\``)
            .addField(`Output ${result.from.text.autoCorrected ? "(autocorrected)" : ""}`, `\`\`\`css\n${"" + result.text}\`\`\``)
            .setTimestamp();
        if(result.from.text.didYouMean) {
            embed.addField("Did you mean?", `\`\`\`css\n${result.from.text.value}\`\`\``);
        }
        await message.channel.send(embed);
    }
}