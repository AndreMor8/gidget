import Discord from 'discord.js';
import gse from 'general-search-engine';
import { checkCleanUrl } from '../../utils/clean-url.js';

export default class extends Command {
    constructor(options) {
        super(options);
        this.description = "Random images";
        this.permissions = {
            user: [0, 0],
            bot: [0, 16384]
        }
    }
    async run(bot, message, args) {
        if (!args[1]) return message.channel.send('First give me a search term.');
        if (bot.badwords.isProfane(args.slice(1).join(" ").toLowerCase()) && !message.channel.nsfw) return message.channel.send("You can't search for that on a non-NSFW channel!");

        const results = await (new gse.search()).setType("image").setQuery(args.slice(1).join(" ")).run().catch(() => []);
        if (!results.length) {
            return message.channel.send("I didn't find anything.");
        }

        if (results.some(e => checkCleanUrl(`https://${e.from}/`)) && !message.channel.nsfw) {
            message.channel.stopTyping(true);
            return message.channel.send("Your search includes NSFW content. To order this content go to an NSFW channel.");
        }

        if (results.some(e => (bot.badwords.isProfane(e.title.toLowerCase()))) && !message.channel.nsfw) {
            message.channel.stopTyping(true);
            return message.channel.send("Your search includes NSFW content. To order this content go to an NSFW channel.");
        }

        const urls = results.map(e => e.image);

        let i = 0;
        const max = urls.length - 1;
        const embed = new Discord.MessageEmbed()
            .setTitle("Image search: " + args.slice(1).join(" "))
            .setDescription(`Use the reactions to move from one image to another`)
            .setFooter(`${i + 1}/${max + 1}`)
            .setImage(urls[i])
            .setColor("RANDOM")

        const filter = (reaction, user) => {
            return ['◀️', '▶️', '⏹️'].includes(reaction.emoji.name) && user.id === message.author.id;
        };
        const msg = await message.channel.send(embed);
        await msg.react('◀️');
        await msg.react('▶️');
        await msg.react('⏹️');

        const collector = msg.createReactionCollector(filter, { idle: 20000 });
        collector.on('collect', async (reaction, user) => {
            if (reaction.emoji.name === '▶️') {

                if (message.guild && message.channel.permissionsFor(message.client.user.id).has("MANAGE_MESSAGES")) {
                    await reaction.users.remove(user.id);
                }
                if (max !== i) {
                    i++
                    embed.setImage(urls[i])
                    embed.setFooter(`${i + 1}/${max + 1}`)
                    await msg.edit(embed);
                }
            }
            if (reaction.emoji.name === '◀️') {
                if (message.guild && message.channel.permissionsFor(message.client.user.id).has("MANAGE_MESSAGES")) {
                    await reaction.users.remove(user.id);
                }
                if (i !== 0) {
                    i--
                    embed.setImage(urls[i])
                    embed.setFooter(`${i + 1}/${max + 1}`)
                    await msg.edit(embed);
                }
            }
            if (reaction.emoji.name === '⏹️') {
                collector.stop();
            }
        })
        collector.on('end', () => {
            if (message.guild && message.channel.permissionsFor(message.client.user.id).has("MANAGE_MESSAGES")) { msg.reactions.removeAll() }
        });
    }
}