const ch = require("child_process");
const exec = require("util").promisify(ch.exec);
const { Util } = require("discord.js");
module.exports = {
    run: async (client, message, args) => {
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
    description: "Execute terminal commands",
    dev: true,
    permissions: {
    user: [0, 0],
    bot: [0, 0]
  }
}