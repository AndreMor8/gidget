import Command from '../../utils/command.js'
import { MessageEmbed } from 'discord.js';
export default class extends Command {
    constructor(options) {
        super(options);
        this.description = "Display the list of server custom responses.";
        this.guildonly = true;
        this.permissions = {
            user: [0, 0],
            bot: [0, 16384]
        }
    }
    async run(bot, message, args) {
        const msgDocument = message.guild.cache.customresponses ? message.guild.customresponses : await message.guild.getCustomResponses();
        if (msgDocument && msgDocument.responses) {
            const { responses } = msgDocument;
            const arr = Object.entries(responses);
            let text = "";
            for (let i in arr) {
                if (text.length < 1800) {
                    text += `**${parseInt(i) + 1}**. ${arr[i][0]} => ${arr[i][1].content}\n\n`
                }
            }
            const embed = new MessageEmbed()
                .setTitle("Custom responses for " + message.guild.name)
                .setDescription(text)
                .setTimestamp()

            await message.channel.send(embed);
        } else return await message.channel.send("There are no custom responses on this server...");
    }
}
