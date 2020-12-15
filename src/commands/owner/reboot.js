
const thing = new Map();
export default class extends Command {
    constructor(options) {
        super(options);
        this.aliases = ['restart'];
        this.secret = true;
        this.description = 'Reboot the bot to update files';
        this.owner = true;
    }
    async run(bot, message) {
        if (bot.voice.connections.size) {
            if (!thing.get(message.author.id)) {
                thing.set(message.author.id, true);
                setTimeout(() => {
                    thing.delete(message.author.id);
                }, 15000);
                return message.channel.send("There are users using the music function! If you do the command again the music will stop on them!");
            }
        }
        await message.channel.send('I\'m rebooting. Check the log to see if I\'m active.');
        process.exit(0);
    }
}
