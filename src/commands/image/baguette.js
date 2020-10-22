import { MessageEmbed } from 'discord.js';

import fetch from "node-fetch";

export default class extends Command {
    constructor(options) {
        super(options)
        this.description = "turn someone into a baguette";
    }
    async run(bot, message) {
        let person = message.mentions.users.first() || message.author

        const msg = await message.channel.send("Generating... (this may take a while)")
        const res = await fetch(`https://nekobot.xyz/api/imagegen?type=baguette&url=${person.displayAvatarURL({ dynamic: true, size: 1024 })}`)
        if (res.ok) {
            const body = await res.json();
            let embed = new MessageEmbed()
                .setTitle("Here ya go")
                .setImage(body.message)
                .setColor("RANDOM")
            await msg.edit(embed)
        }
        else return await message.channel.send("Something happened with the third-party API")
    }
}
