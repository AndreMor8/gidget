const Discord = require('discord.js');

module.exports = {
    run: async (bot, message, args) => {
        if (message.deletable) message.delete();

        const hook = new Discord.WebhookClient(process.env.TRW_ID, process.env.TRW_TOKEN);

        if (!args[1]) return message.reply(`Nothing to say?`).then(message => message.delete({timeout: 5000}));

        hook.send(args.slice(1).join(" "));
    },
    aliases: [],
    secret: true,
    owner: true,
    description: "The real Wubbzy webhook",
}