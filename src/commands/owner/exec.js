const { execSync } = require("child_process");
const { Util } = require("discord.js");
module.exports = {
    run: async (client, message, args) => {
        if (message.author.id !== "577000793094488085") return message.channel.send("Only AndreMor can use this command");
        try {
            let process = execSync(args.slice(1).join(" "));
            if (!process.toString()) return message.channel.send("Command executed, but no output");
            const text = Util.splitMessage(process.toString());
            message.channel.send(text[0], { code: "sh" });
        } catch (error) {
            const text = Util.splitMessage(error.toString());
            message.channel.send(text[0], { code: "sh" });
        }
    },
    aliases: [],
    description: "Execute terminal commands"
}