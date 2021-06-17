export default class extends Command {
    constructor(options) {
        super(options);
        this.description = "This messes up the song array. Inreversible action.";
    }
    async run(bot, message) {

        const channel = message.member.voice.channel;
        if (!channel) return message.channel.send("You need to be in a voice channel to pause music!");

        const queue = bot.distube.getQueue(message);
        if (!queue) return message.channel.send(`There is nothing playing.`);
        if (queue.voiceChannel.id !== channel.id) return message.channel.send("You are not on the same voice channel as me.");

        queue.shuffle();

        await message.channel.send("All the songs have been randomly shuffled.\nUse `g%queue` to see the new order");
    }
}