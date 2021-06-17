const thing = new Set();
export default class extends Command {
    constructor(options) {
        super(options);
        this.aliases = ['restart'];
        this.secret = true;
        this.description = 'Reboot the bot to update files';
        this.owner = true;
    }
    async run(bot, message) {
        if ((await bot.shard.broadcastEval(c => c.voice.adapters.size)).reduce((a, c) => a + c, 0)) {
            if (!thing.has(message.author.id)) {
                thing.add(message.author.id);
                setTimeout(() => {
                    thing.delete(message.author.id);
                }, 15000);
                return message.channel.send("There are users using the music function! If you do the command again the music will stop on them!");
            }
        }
        await message.channel.send('I\'m rebooting. Check the log to see if I\'m active.');
        if(bot.shard.masterEval) {
            await bot.shard.masterEval("process.exit(0)");
        } else {
            process.exit(0);
        }
    }
}
