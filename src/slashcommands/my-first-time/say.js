import { MessageEmbed } from "discord.js";

export default class extends SlashCommand {
    constructor(options) {
        super(options);
        this.deployOptions.description = "Make the bot repeat you";
        this.deployOptions.options = [
            {
                name: "to-say",
                description: "Why else, what I will repeat.",
                type: "STRING",
                required: true
            }
        ]
        this.onlyguild = true;
    }
    async run(bot, interaction) {
        await interaction.reply({ embeds: [new MessageEmbed().setTitle("Say command").setDescription(interaction.options.get("to-say").value)] });
    }
}