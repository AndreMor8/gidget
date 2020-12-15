import Discord from 'discord.js';

import wikijs from 'wikijs';

export default class extends Command {
    constructor(options) {
        super(options);
        this.secret = true;
        this.description = "Search something in a wiki";
    }
    async run(bot, message, args) {
        const algo = "Usage: `wiki <api.php link> <article>`";
        if (!args[1])
            return message.channel.send(algo);
        if (!args[1])
            return message.channel.send(algo);
        try {
            if (!/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()!@:%_+.~#?&//=]*)/g.test(args[1]))
                return message.channel.send("Send a normal link to the `api.php` of the wiki where you want to search information");
            const wiki = wikijs.default({
                apiUrl: args[1]
            });
            const page_data = await wiki.page(args.slice(2).join(" "));
            const esto = await page_data.summary();
            const arr = Discord.Util.splitMessage(esto);
         await message.channel.send(arr[0]);
        } catch (err) {
            console.log(err);
         await message.channel.send("Error: " + err);
        }
    }
}
