export default class extends Command {
    constructor(options) {
        super(options);
        this.description = "Remove a song from the queue";
        this.guildonly = true;
    }
    async run(bot, message, args) {
        if (!args[1]) return message.channel.send("Put the song row number to remove it");
        const voiceChannel = message.member.voice.channelID;
        if (!voiceChannel) return message.channel.send("You need to be in a voice channel to remove a song!");
        const serverQueue = message.guild.queue
        if (!serverQueue) return message.channel.send("There is nothing playing.")
        if (serverQueue && serverQueue.inseek) return;
        if (serverQueue) {
            if (serverQueue.voiceChannel.id !== voiceChannel)
                return message.channel.send("I'm on another voice channel!");
        }
        const number = parseInt(args[1]);
        if (!number) return message.channel.send("Invalid number");
        if (number < 1) return message.channel.send("Invalid number");
        if (number == 1) return message.channel.send("You cannot remove the current song. Use `skip` for that");
        const songs = serverQueue.songs;
        if (songs.length < number) return message.channel.send("Invalid number. Use `queue` to see the current queue");
        const realnumber = number - 1;
        songs.splice(realnumber, 1);
        await message.channel.send("Song #" + number + " removed from the queue");
    }
}
