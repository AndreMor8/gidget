const Discord = require('discord.js');

module.exports = {
    run: async (bot, message, args) => {
        let user = message.client.users.cache.get(args[1]) || message.mentions.users.first() || args[1];

        if (user) {
            var member = await message.guild.members.fetch(user).catch(err => { });

            if (member) {
                if (!member.bannable) return message.channel.send("I can't ban that user! Make sure I have the correct permission and that the person's role is not greater than mine.");
                if (args[2]) {
                    member.ban({ reason: 'Ban command - ' + args.slice(2).join(" ") }).then(() => {
                        message.reply(`I've banned ${user.tag} <:WidgetBan:610310292286603264> with reason: ` + args.slice(2).join(" "));
                    }).catch(err => {
                        message.reply("Sorry I couldn\'t ban that user.");
                        console.log(err);
                    });
                } else {
                    member.ban({ reason: 'Ban command' }).then(() => {
                        message.reply(`I've banned ${user.tag} <:WidgetBan:610310292286603264>`);
                    }).catch(err => {
                        message.reply("Sorry I couldn\'t ban that user.");
                        console.log(err);
                    });
                }
            } else {
                message.reply("member not found. Mention someone or put their ID.");
            }
        } else {
            message.reply("Specify a server member to ban them! <:WidgetBan:610310292286603264>");
        }
    },
    aliases: [],
    guildonly: true,
    description: "Ban a member from the server",
    permissions: {
        user: [4, 0],
        bot: [4, 0]
    }
}