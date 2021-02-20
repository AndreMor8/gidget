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
        if(!args[1]) return message.channel.send("Please put an episode name");
        const pages = (await bot.wubbzy.getPagesInCategory("Category:Episodes", { cmlimit: 300, cmtype: "page" })).filter(e => !e.includes("/"));
        const page = pages.find(e => e.toLowerCase() === args.slice(1).join(" ").toLowerCase());
        if(!page) return message.channel.send("Invalid episode!");
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