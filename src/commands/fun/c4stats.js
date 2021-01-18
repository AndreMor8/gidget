import Discord from 'discord.js';

export default class extends Command {
    constructor(options) {
        super(options);
        this.description = "Stats of the game Connect4";
        this.permissions = {
            user: [0, 0],
            bot: [0, 16384]
        };
        this.aliases = [];
    }
    async run(bot, message, args) {

        const member = message.guild.members.cache.find(a => a.user.username === args.slice(1).join(' ')) || message.guild.members.cache.find(a => a.user.tag === args.slice(1).join(' ')) || message.guild.members.cache.find(a => a.displayName === args.slice(1).join(' ')) || message.guild.members.cache.get(args[1]) || message.mentions.members.first() || await message.guild.members.fetch(args[1]).catch(() => {}) || message.member

        const data = await require('../../database/models/c4').find({ id: member.user.id });

        if (!data || !data.length)
            message.reply(`Not data yet.`);

        const easy = data.find(item => item.difficulty == 'easy'),
            medium = data.find(item => item.difficulty == 'medium'),
            hard = data.find(item => item.difficulty == 'hard')

        const embed = new Discord.MessageEmbed()
            .setColor(member.roles.color.hexColor)
            .setAuthor(member.user.tag, member.user.displayAvatarURL({ size: 2048, dynamic: true }))
        if (easy) embed.addField('Easy', `Wins: ${easy.wins} Loses: ${easy.loses}`)
        if (medium) embed.addField('Medium', `Wins: ${medium.wins} Loses: ${medium.loses}`)
        if (hard) embed.addField('Hard', `Wins: ${hard.wins} Loses: ${hard.loses}`)

        return message.channel.send({ embed: embed });
    }
}
