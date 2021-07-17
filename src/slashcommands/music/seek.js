import ms from "ms";

export default class extends SlashCommand {
    constructor(options) {
        super(options);
        this.deployOptions.description = "Change the position of the stream";
        this.deployOptions.options = [{
            name: "to-seek",
            type: "STRING",
            description: "What position do I move it to?",
            required: true
        }]
        this.guildonly = true;
        this.permissions = {
            user: [0n, 0n],
            bot: [0n, 0n]
        };
    }
    async run(bot, interaction) {
        const channel = interaction.member.voice.channel;
        if (!channel) return interaction.reply("You need to be in a voice channel to seek music!");
        const queue = bot.distube.getQueue(interaction.guild.me.voice);
        if (!queue) return interaction.reply(`There is nothing playing.`);
        if (queue.voiceChannel.id !== channel.id) return interaction.reply("You are not on the same voice channel as me.");

        const exp = interaction.options.get("to-seek").value.split(":");
        //More support?
        const sec = exp[exp.length - 1]
        const min = exp[exp.length - 2] || "0"
        const hrs = exp[exp.length - 3] || "0"
        const reconverted = (ms(hrs + "h") / 1000) + (ms(min + "m") / 1000) + (ms(sec + "s") / 1000);
        if (isNaN(reconverted) || (typeof reconverted !== "number")) return interaction.reply("Invalid value!");

        if (queue.songs[0].duration <= (reconverted + 2)) return interaction.reply("The song is too short for the specified time!");

        queue.seek(reconverted);

        await interaction.reply(`Position moved to ${hrs}:${min}:${sec}`);
    }
}
