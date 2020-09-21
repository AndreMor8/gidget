import Command from '../../utils/command.js';

export default class extends Command {
    constructor(options) {
        super(options);
        this.aliases = [];
        this.guildonly = true;
        this.description = "kick a member from the server";
        this.permissions = {
            user: [2, 0],
            bot: [2, 0]
        }
    }
    async run(message, args) {
        let user = message.client.users.cache.get(args[1]) || message.mentions.users.first() || args[1];
        if (user) {
            var member = message.guild.member(user);

            if (member) {
                if (!member.kickable) return message.channel.send("I can't kick that user! Make sure I have the correct permission and that the person's role is not greater than mine.");
                if (args[2]) {
                    member.kick('Kick command - ' + args[2]).then(() => {
                        message.reply(`I've kicked ${user.tag} <:WubbzyKick:460284747311087620> with reason: ` + args.slice(2).join(" "));
                    }).catch(err => {
                        message.reply("Sorry I couldn\'t kick that user.");
                        console.log(err);
                    });
                } else {
                    member.kick('Kick command').then(() => {
                        message.reply(`I've kicked ${user.tag} <:WubbzyKick:460284747311087620>`);
                    }).catch(err => {
                        message.reply("Sorry I couldn\'t kick that user.");
                        console.log(err);
                    });
                }
            } else {
                message.reply("member not found. Mention someone or put their ID.");
            }
        } else {
            message.reply("Specify a server member to kick them! <:WubbzyKick:460284747311087620>");
        }
    }
}