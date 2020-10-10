import Command from "../../utils/command.js";
export default class extends Command {
    constructor(options) {
        super(options);
        this.description = "Bot test";
    }
    async run(message, args) {
     await message.channel.send("Pong!")
            .then((msg) => {
                msg.edit("Ping: " + (Date.now() - msg.createdTimestamp) + 'ms\nPing from the API: ' + this.bot.ws.ping + 'ms');
            });
    }
}