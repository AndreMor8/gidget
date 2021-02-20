import { MessageEmbed } from 'discord.js';

export default class extends Command {
    constructor(options) {
        super(options);
        this.aliases = ['tt'];
        this.description = "Shows a title card from the Wubbzy show!";
        this.permissions = {
            user: [0, 0],
            bot: [0, ]
        }
    }
    async run(bot, message, args) {
        const pages = (await bot.wubbzy.getPagesInCategory("Category:Episodes", { cmtype: "page" })).filter(e => !e.includes("/"));
        const page = pages.find(e => {
            const to = e.replace("(episode)", "").trimEnd();
            return to.toLowerCase() === args.slice(1).join(" ").toLowerCase() || to.replace("!", "").toLowerCase() === args.slice(1).join(" ").toLowerCase();
        });
        if(!args[1] || !page) {
           const embed = new MessageEmbed()
           .setDescription(pages.map(e => e.replace("(episode)", "").trimEnd()).join("\n"))
           .setTitle("List of episodes");
           return await message.channel.send(embed);
        }
        const res = await bot.wubbzy.request({
            "action": "imageserving",
            "wisTitle": page,
        });
        const embed = new MessageEmbed()
        .setImage(`${res.image.imageserving}&format=original`)
        .setTitle(`${page}'s title card`);
        await message.channel.send(embed);
    }
}