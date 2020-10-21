import { MessageEmbed } from 'discord.js';

import fetch from "node-fetch";

export default class extends Command {
    constructor(options) {
        super(options)
        this.description = "Blurpify some user avatar";
    }
    async run(bot, message, args) {
        let person = message.mentions.users.first() || message.author
        const msg = await message.channel.send("Blurpifying... (this may take a while)")
        const res = await fetch(`https://nekobot.xyz/api/imagegen?type=blurpify&image=${person.displayAvatarURL({ size: 1024, dynamic: true })}`);
        if (res.ok) {
            const body = await res.json();
            let embed = new MessageEmbed()
                .setTitle(`${person.username} got blurpified`)
                .setImage(body.message)
                .setColor("RANDOM")
            await msg.edit(embed)
        }
        else return await message.channel.send("Something happened with the third-party API")
    }
}
