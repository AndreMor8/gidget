let font;
import path from 'path';
import commons from '../../utils/commons.js';
const { __dirname } = commons(import.meta.url);
import Jimp from 'jimp';
import Command from '../../utils/command.js';
export default class extends Command {
    constructor(options) {
        super(options);
        this.description = "Wubbfont";
    }
    async run(message, args) {
        if(!args[1]) return message.channel.send("Put something");
        if(!font) font = await Jimp.loadFont(path.join(__dirname, "/../../utils/", "font.fmt"));
        const image = new Jimp(1024, 768);
        //E
    }
}