const gtranslate = require('translate-google');
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

        //Get text
        let text = args.slice(1).join(" ");
        if (text.length > 700) {
            message.channel.send("The message is too long!!").then(m => m.delete({ timeout: 3000 }))
            return;
        }

        let ptext = text;
        text = text.split(/(?=[?!.])/gi);
        text.push(" ");
        gtranslate(text, { to: lang }).then(res => {
            let embed = new MessageEmbed()
                .setTitle("Translate")
                .setColor("RANDOM")
                .addField('Input', `\`\`\`css\n${ptext}\`\`\``)
                .addField('Lang', `\`\`\`css\n${lang}\`\`\``)
                .addField('Output', `\`\`\`css\n${"" + res.join(" ")}\`\`\``)
                .setTimestamp()
            message.channel.send(embed)
        }).catch(err => {
            message.channel.send(`Could not find that language! Visit this page for avaliable languages: https://github.com/shikar/NODE_GOOGLE_TRANSLATE/blob/master/languages.js`).then(m => m.delete({ timeout: 9000 }))
        })
    },
    aliases: [],
    description: "Translate things",
}