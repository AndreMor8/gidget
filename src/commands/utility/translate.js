const { default:gtranslate, parseMultiple } = require('google-translate-open-api');
const languages = require("../../utils/languages");
const { MessageEmbed } = require("discord.js")

module.exports = {
    run: async (bot, message, args) => {
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

        const reallang = languages.getCode(lang);
        if(!reallang) return message.channel.send("Invalid language!\nhttps://github.com/AndreMor955/gidget/blob/master/src/utils/languages.js")

        //Get text
        let text = args.slice(1).join(" ");
        if (text.length > 700) {
            message.channel.send("The message is too long!!").then(m => m.delete({ timeout: 3000 }))
            return;
        }

        let ptext = text;
        text = text.split(/(?=[?!.])/gi);
        text.push(" ");
        gtranslate(text, { to: reallang }).then(result => {
            const translated = result.data[0];
            const res = parseMultiple(translated);
            let embed = new MessageEmbed()
                .setTitle("Translate")
                .setColor("RANDOM")
                .addField('Input', `\`\`\`css\n${ptext}\`\`\``)
                .addField('Lang', `\`\`\`css\n${reallang}\`\`\``)
                .addField('Output', `\`\`\`css\n${"" + res.join(" ")}\`\`\``)
                .setTimestamp()
            message.channel.send(embed)
        }).catch(err => {
            console.log(err);
        })
    },
    aliases: [],
    description: "Translate things",
    permissions: {
        user: [0, 0],
        bot: [0, 16384]
    }
}