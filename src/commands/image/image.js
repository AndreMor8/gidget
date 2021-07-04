import Discord from 'discord.js';
import gse from 'general-search-engine';
import { checkCleanUrl } from '../../utils/clean-url.js';

export default class extends Command {
    constructor(options) {
        super(options);
        this.description = "Random images";
        this.permissions = {
            user: [0n, 0n],
            bot: [0n, 16384n]
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
            .setDescription(`Use the buttons to move from one image to another`)
            .setFooter(`${i + 1}/${max + 1}`)
            .setImage(urls[i])
            .setColor("RANDOM");

        const but_back = new Discord.MessageButton()
            .setCustomID("image_c_back")
            .setStyle("SECONDARY")
            .setLabel("Back");

        const but_stop = new Discord.MessageButton()
            .setCustomID("image_c_stop")
            .setStyle("DANGER")
            .setLabel("Stop");

        const but_next = new Discord.MessageButton()
            .setCustomID("image_c_next")
            .setStyle("SECONDARY")
            .setLabel("Next");

        const filter = (button) => {
            if (button.user.id !== message.author.id) button.reply({ content: "Use your own instance by using `g%image <query>`", ephemeral: true });
            return button.user.id === message.author.id;
        };
        const msg = await message.channel.send({ embeds: [embed], components: [new Discord.MessageActionRow().addComponents([but_back, but_stop, but_next])] });

        const collector = msg.createMessageComponentInteractionCollector({ filter, idle: 30000 });
        collector.on('collect', async (button) => {
            if (button.customID === 'image_c_next') {
                if (max !== i) {
                    i++
                    embed.setImage(urls[i])
                    embed.setFooter(`${i + 1}/${max + 1}`)
                    await button.update({ embeds: [embed], components: [new Discord.MessageActionRow().addComponents(((max === i ? [but_back.setDisabled(false), but_stop, but_next.setDisabled(true)] : [but_back.setDisabled(false), but_stop, but_next.setDisabled(false)])))] });
                }
            }
            if (button.customID === 'image_c_back') {
                if (i !== 0) {
                    i--
                    embed.setImage(urls[i])
                    embed.setFooter(`${i + 1}/${max + 1}`)
                    await button.update({ embeds: [embed], components: [new Discord.MessageActionRow().addComponents(((i === 0 ? [but_back.setDisabled(true), but_stop, but_next.setDisabled(false)] : [but_back.setDisabled(false), but_stop, but_next.setDisabled(false)])))] });
                }
            }
            if (button.customID === 'image_c_stop') {
                collector.stop("stoped");
            }
        })
        collector.on('end', (c, r) => {
            if (r === "stoped") c.last().update({ embeds: [embed], components: [new Discord.MessageActionRow().addComponents([but_back.setDisabled(true), but_stop.setDisabled(true), but_next.setDisabled(true)])] })
            else msg.edit({ embeds: [embed], components: [new Discord.MessageActionRow().addComponents([but_back.setDisabled(true), but_stop.setDisabled(true), but_next.setDisabled(true)])] });
        });
    }
}