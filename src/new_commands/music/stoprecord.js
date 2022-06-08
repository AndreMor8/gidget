export default class extends SlashCommand {
    constructor(options) {
        super(options);
        this.deployOptions.description = "Stop the recording you've been making...";
    }
    async run(bot, interaction) {
        if (!interaction.member.voice.channel) return await interaction.reply("You need to be in a voice channel to stop record something!");
        const rec = bot.records.get(interaction.guild.id);
        if (!rec) return await interaction.reply("No recording in progress...");
        if (rec.user_id !== interaction.user.id) return await interaction.reply("Only whoever started the recording can stop it.");
        rec.stream.destroy();
        await interaction.reply({ ephemeral: true, content: "Recording stopped!" });
    }
}