const wikijs = require('wikijs').default;

module.exports = {
    run: async (bot, message, args) => {
        const algo = "Usage: `wiki <api.php link> <article>`";
        if(!args[1]) return message.channel.send(algo);
        if(!args[1]) return message.channel.send(algo);
        try {
            if(!/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()!@:%_\+.~#?&\/\/=]*)/g.test(args[1])) return message.channel.send("Send a normal link to the `api.php` of the wiki where you want to search information")
            const wiki = wikijs({
                apiUrl: args[1]
            });
            let page_data = await wiki.page(args.slice(2).join(" "));
            let esto = await page_data.summary();
            let arr = require("discord.js").Util.splitMessage(esto);
            message.channel.send(arr[0]);
        } catch (err) {
            console.log(err);
            message.channel.send("Error: " + err);
        }
    },
    aliases: [],
    secret: true,
    description: "Search something in a wiki"
}