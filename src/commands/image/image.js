import Discord from 'discord.js';
import gse from 'general-search-engine';
import { checkCleanUrl } from '../../utils/clean-url.js';
import { MessageButton } from 'discord-buttons';

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
            .setDescription(`Use the buttons to move from one image to another`)
            .setFooter(`${i + 1}/${max + 1}`)
            .setImage(urls[i])
            .setColor("RANDOM");

        const but_back = new MessageButton()
            .setID("image_c_back")
            .setStyle("gray")
            .setLabel("Back");

        const but_stop = new MessageButton()
            .setID("image_c_stop")
            .setStyle("red")
            .setLabel("Stop");

        const but_next = new MessageButton()
            .setID("image_c_next")
            .setStyle("gray")
            .setLabel("Next");

        const filter = (button) => {
            if ((button.clicker.user?.id || button.message.channel.recipient.id) !== message.author.id) button.reply.send("Use your own instance by using `g%image <query>`", true);
            return (button.clicker.user?.id || button.message.channel.recipient.id) === message.author.id;
        };
        const msg = await message.channel.send("", { embed, buttons: [but_back.setDisabled(true), but_stop, but_next.setDisabled(false)] });

        const collector = msg.createButtonCollector(filter, { idle: 20000 });
        collector.on('collect', async (button) => {
            await button.defer();
            if (button.id === 'image_c_next') {

                if (max !== i) {
                    i++
                    embed.setImage(urls[i])
                    embed.setFooter(`${i + 1}/${max + 1}`)
                    await msg.edit("", { embed, buttons: ((max === i ? [but_back.setDisabled(false), but_stop, but_next.setDisabled(true)] : [but_back.setDisabled(false), but_stop, but_next.setDisabled(false)])) });
                }

            }
            if (button.id === 'image_c_back') {
                if (i !== 0) {
                    i--
                    embed.setImage(urls[i])
                    embed.setFooter(`${i + 1}/${max + 1}`)
                    await msg.edit("", { embed, buttons: ((i === 0 ? [but_back.setDisabled(true), but_stop, but_next.setDisabled(false)] : [but_back.setDisabled(false), but_stop, but_next.setDisabled(false)])) });
                }
            }
            if (button.id === 'image_c_stop') {
                collector.stop();
            }
        })
        collector.on('end', () => {
            msg.edit("", { embed, buttons: [but_back.setDisabled(true), but_stop.setDisabled(true), but_next.setDisabled(true)] });
        });
    }
}