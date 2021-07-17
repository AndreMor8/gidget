export default class extends SlashCommand {
    constructor(options) {
        super(options);
        this.deployOptions.description = "This messes up the song array. Inreversible action.";
    }
    async run(bot, interaction) {

        const channel = interaction.member.voice.channel;
        if (!channel) return interaction.reply("You need to be in a voice channel to pause music!");

        const queue = bot.distube.getQueue(interaction.guild.me.voice);
        if (!queue) return interaction.reply(`There is nothing playing.`);
        if (queue.voiceChannel.id !== channel.id) return interaction.reply("You are not on the same voice channel as me.");

        queue.shuffle();

        await interaction.reply("All the songs have been randomly shuffled.\nUse `g%queue` to see the new order");
    }
}