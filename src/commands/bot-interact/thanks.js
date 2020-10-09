import { MessageEmbed } from 'discord.js';
import Command from '../../utils/command.js';

export default class extends Command {
    constructor(options) {
        super(options);
        this.description = "Thanks";
    }
    async run(message, args) {
        const embed = new MessageEmbed()
        .setTitle("Some of the people who helped in some way with this project =D")
        .addField((await this.bot.users.fetch("455891977712566274")).tag, "Current bot and dashboard hosting.")
        .addField((await this.bot.users.fetch("398321973404368927")).tag, "https://gidget.xyz domain (1 year)")
        .addField((await this.bot.users.fetch("224619540263337984")).tag, "Previous hosting on Heroku (so it's 24/7, not 22 days)")
        .addField((await this.bot.users.fetch("756733721171984444")).tag, "Support server creation and design")
        .addField("GitHub", "[Those who contributed to the bot code](https://github.com/AndreMor955/gidget/graphs/contributors)")
        await message.channel.send(embed);
    }
}