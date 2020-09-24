import { MessageEmbed } from 'discord.js';
import Command from "../../utils/command.js";
import fetch from "node-fetch";

export default class extends Command {
    constructor(options) {
        super(options)
        this.description = "turn someone into a baguette";
    }
    async run(message, args) {
        let person = message.mentions.users.first() || message.author
        
        const msg = await message.channel.send("Generating... (this may take a while)")
        fetch(`https://nekobot.xyz/api/imagegen?type=baguette&url=${person.displayAvatarURL({dynamic: true, size: 1024})}`)
        .then((res) => {
            if(res.ok) res.json().then((body) => {
            console.log(body)
            let embed = new MessageEmbed()
            .setTitle("Here ya go")
            .setImage(body.message)
            .setColor("RANDOM") 
            msg.edit(embed)
        })
            else return message.channel.send("Something happened with the third-party API")
        })
    }
}
