import Command from '../../utils/command.js';
export default class extends Command {
    constructor(options) {
        super(options);
        this.description = "Reverse some text";
    }
    async run(message, args) {
        if (!args[1])
            return message.reply('you must input text to be reversed!');
        message.channel.send(args.slice(1).join(' ').split('').reverse().join(''));
    }
}