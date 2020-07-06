const { execSync } = require("child_process");

module.exports = {
    run: async (client, message, args) => {
        if (message.author.id !== "577000793094488085") return message.channel.send("Only AndreMor can use this command");
        try {
            let process = execSync(args.slice(1).join(" "));
            if (!process.toString()) return message.channel.send("Command executed, but no output");
            message.channel.send(process, { code: "sh" });
        } catch (error) {
            message.channel.send(error, { code: "sh" });
        }
    },
    aliases: [],
    description: "Execute terminal commands"
}