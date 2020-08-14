const ch = require("child_process");
const exec = require("util").promisify(ch.exec);
const { Util } = require("discord.js");
module.exports = {
    run: async (client, message, args) => {
        if (message.author.id !== "577000793094488085") return message.channel.send("Only AndreMor can use this command");
        try {
            const { stdout, stderr } = await exec(args.slice(1).join(" "));
            if (!stdout && !stderr) return message.channel.send("Command executed, but no output");
            if(stdout) {
                const text = Util.splitMessage(stdout, {maxLength: 1950});
                await message.channel.send(text[0], { code: "sh" });
            }
            if(stderr) {
                const text = Util.splitMessage(stderr, {maxLength: 1950});
                await message.channel.send(text[0], { code: "sh" });
            }
        } catch (error) {
            const text = Util.splitMessage(error.toString(), {maxLength: 1950});
            await message.channel.send(text[0], { code: "sh" });
        }
    },
    aliases: [],
    description: "Execute terminal commands"
}