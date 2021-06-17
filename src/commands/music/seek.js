import ms from "ms";

export default class extends Command {
    constructor(options) {
        super(options);
        this.aliases = [];
        this.description = "Change the position of the stream";
        this.guildonly = true;
        this.permissions = {
            user: [0n, 0n],
            bot: [0n, 0n]
        };
    }
    async run(bot, message, args) {
        const channel = message.member.voice.channel;
        if (!channel) return message.channel.send("You need to be in a voice channel to seek music!");
        const queue = bot.distube.getQueue(message);
        if (!queue) return message.channel.send(`There is nothing playing.`);
        if (queue.voiceChannel.id !== channel.id) return message.channel.send("You are not on the same voice channel as me.");

        const exp = args[1].split(":")
        //More support?
        const sec = exp[exp.length - 1]
        const min = exp[exp.length - 2] || "0"
        const hrs = exp[exp.length - 3] || "0"
        const reconverted = (ms(hrs + "h") / 1000) + (ms(min + "m") / 1000) + (ms(sec + "s") / 1000);
        if (isNaN(reconverted) || (typeof reconverted !== "number")) return message.channel.send("Invalid value!");

        if (queue.songs[0].duration <= (reconverted + 2)) return message.channel.send("The song is too short for the specified time!");

        queue.seek(reconverted);

        await message.channel.send(`Position moved to ${hrs}:${min}:${sec}`);
    }
}
