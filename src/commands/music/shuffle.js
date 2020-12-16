export default class extends Command {
    constructor(options) {
        super(options);
        this.description = "This messes up the song array (including the first song). Inreversible action.";
    }
    async run(bot, message) {
        const serverQueue = message.guild.queue;
        if (serverQueue && serverQueue.inseek) return;
        const musicVariables = message.guild.musicVariables;
        if (!message.member.voice.channel) return message.channel.send("You need to be in a voice channel to shuffle music!");
        if (!musicVariables || !serverQueue) return message.channel.send("There is nothing playing that I could stop.");
        if (serverQueue.voiceChannel.id !== message.member.voice.channel.id) return message.channel.send("I'm on another voice channel!");
        serverQueue.songs.sort(() => Math.random() - 0.5);
        serverQueue.loop = { shuffle: true };
        serverQueue.connection.dispatcher.end();
        await message.channel.send("All the songs have been randomly shuffled.\nUse `g%queue` to see the new order");
    }
}