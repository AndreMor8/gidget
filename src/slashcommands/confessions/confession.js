import { MessageEmbed } from "discord.js";

export default class extends SlashCommand {
    constructor(options) {
        super(options);
        this.deployOptions.description = "Confess something to others on this server!";
        this.deployOptions.options = [
            {
                name: "message",
                description: "What do you want to confess?",
                type: "STRING",
                required: true
            },
            {
                name: "anon",
                description: "Do you want me to anonymize your confession? (only available on certain servers)",
                type: "BOOLEAN",
                required: false
            }
        ]
        this.guildonly = true;
    }
    async run(bot, interaction) {
        const data = interaction.guild.cache.confessionconfig ? interaction.guild.confessionconfig : await interaction.guild.getConfessionConfig();
        if (!data.channelID) return interaction.reply({ content: "The server hasn't set up a confession channel yet!\nDo it with `g%confessionconfig channel <channel>`", ephemeral: true });
        const user_anon = interaction.options.get("anon")?.value;
        if (!data.anon && user_anon) return interaction.reply({ content: 'Sorry, the server does not accept anonymous confessions.', ephemeral: true });
        const channel = interaction.guild.channels.cache.get(data.channelID);
        if (!channel) return interaction.reply({ content: "It seems that the channel set by the admin does not exist!\nSet the channel again with `g%confessionconfig channel <channel>`", ephemeral: true })

        const embed = new MessageEmbed()
            .setTitle("New confession")
            .setAuthor(user_anon ? "Anonymous" : interaction.user.tag, user_anon ? undefined : interaction.user.displayAvatarURL({ dynamic: true }))
            .setDescription(interaction.options.get("message").value)
            .setTimestamp()
            .setColor("RANDOM");
        await channel.send({ embeds: [embed] });

        await interaction.reply({ content: `The confession has been sent! Check it in ${channel.toString()}`, ephemeral: true })
    }
}