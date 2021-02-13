import { MessageAttachment, MessageEmbed } from 'discord.js';
export default class extends Command {
    constructor(options) {
        super(options);
        this.description = "Thanks";
    }
    async run(bot, message) {
        message.channel.startTyping();
        const att = new MessageAttachment("https://contributors-img.web.app/image?repo=AndreMor955/gidget", "contributors.png");
        const embed = new MessageEmbed()
        .attachFiles([att])
        .setTitle("Some of the people who helped in some way with this project =D")
        .addField("Steven Castro", "Current bot hosting")
        .addField("Awoo", "Access to a free VPS :)")
        .addField("Hyuuh", "https://gidget.xyz domain (1 year)")
        .addField("NeonBluu", "Support server creation and design")
        .addField("GitHub", "[Those who contributed to the bot code](https://github.com/AndreMor955/gidget/graphs/contributors)")
        .setImage("attachment://contributors.png");
        await message.channel.send(embed);
        message.channel.stopTyping();
    }
}
