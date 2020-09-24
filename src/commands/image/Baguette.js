import Command from "../../utils/command.js";
import fetch from "node-fetch";

export default class extends Command {
    constructor(options) {
        super(options)
        this.description = "turn someone into a baguette";
        this.category = "Image Manipulation"
    }
    async run(message, args) {
        let person = message.mentions.users.first() || message.author

        
        const msg = await message.channel.send("Generating...(this may take a while)")
        fetch(`https://nekobot.xyz/api/imagegen?type=baguette&url=${person.displayAvatarURL({dynamic: true, size: 1024})}`)
        .then((res) => res.json())
        .then((body) => {
            console.log(body)
            let embed = new MessageEmbed()
            .setTitle("Here ya go")
            .setImage(body.message)
            .setColor("RANDOM") 
            msg.edit(embed)
        })
    }
}