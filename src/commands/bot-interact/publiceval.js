var safeEval = require('notevil')
const Discord = require("discord.js");
module.exports = {
    run: async (bot, message, args) => {
        if (!args[1]) return message.channel.send("Put something to evaluate.");
        let limit = 1005;
        let algo = 0;
        let code = args.slice(1).join(' ');
        try {
            let evalued = await safeEval(code, {
                "JSON": Object.create(JSON),
                "Math": Object.create(Math),
                send: function (obj1, obj2) {
                    if(algo > 2) throw new Error("Only 3 messages per instance")
                    algo++;
                    if(!obj1) throw new Error("You have not entered anything.");
                    if(obj1 instanceof Object && obj1.hasOwnProperty("allowedMentions")) throw new Error("You cannot modify that value");
                    if(obj2 instanceof Object && obj2.hasOwnProperty("allowedMentions")) throw new Error("You cannot modify that value");
                    message.channel.send(obj1, obj2);
                    return true;
                },
            });
            if (typeof evalued !== "string")
                evalued = require("util").inspect(evalued, { depth: 0 });
            let txt = "" + evalued;
            if (txt.length > limit) {
                const embed = new Discord.MessageEmbed()
                    .setAuthor("Evaluation done!", bot.user.displayAvatarURL())
                    .addField("Input", `\`\`\`js\n${code}\n\`\`\``)
                    .addField("Output", `\`\`\`js\n ${txt.slice(0, limit)}\n\`\`\``)
                    .setColor("RANDOM")
                    .setFooter("Requested by: " + message.author.tag)
                message.channel.send(embed);
            } else {
                var embed = new Discord.MessageEmbed()
                    .setAuthor("Evaluation done!", bot.user.displayAvatarURL())
                    .addField("Input", `\`\`\`js\n${code}\n\`\`\``)
                    .addField("Output", `\`\`\`js\n ${txt}\n\`\`\``)
                    .setColor("RANDOM")
                    .setFooter("Requested by: " + message.author.tag)
                message.channel.send(embed);
            }
        } catch (err) {
            const embed = new Discord.MessageEmbed()
                .setAuthor("Something happened!", bot.user.displayAvatarURL())
                .addField("Input", `\`\`\`js\n${code}\n\`\`\``)
                .addField("Output", `\`\`\`js\n${err}\n\`\`\``)
                .setColor("RANDOM")
                .setFooter("Requested by: " + message.author.tag)
            message.channel.send(embed);
        }
    },
    aliases: [],
    description: "Evaluate JavaScript code. The bot is not at risk."
}