import Discord from 'discord.js';
export default class extends Command {
    constructor(options) {
        super(options);
        this.description = "Info about Gidget in plain text";
    }
    async run(bot, message, args) {
        if (args[1] === 'morse') await message.channel.send(`.. / .- -- / --. .. -.. --. . - --..-- / .- / .-. --- -... --- - / .... --- ... - . -.. / --- -. / --. .-.. .. - -.-. .... --..-- / -.-. .-. . .- - . -.. / -... -.-- / .-- .. -.. --. . - .-.-.- / .. / .... --- .--. . / - --- / -... . / ..- ... . ..-. ..- .-.. / ... --- -- . -.. .- -.-- -.-.--\n\n- .... . / .-- .- -.-- / .. / -.-. --- -- -- ..- -. .. -.-. .- - . / .-- .. - .... / - .... . / -.. .. ... -.-. --- .-. -.. / .- .--. .. / .. ... / .-- .-. .. - - . -. / .. -. / .--- .- ...- .- ... -.-. .-. .. .--. - / ..- ... .. -. --. / -.. .. ... -.-. --- .-. -.. .-.-.- .--- ... / ...- .---- ..--- .-.-.- .---- .-.-.- .---- --..-- / - .... .- -. -.- ... / - --- / .- -. -.. .-. . -- --- .-. / ..-. --- .-. / .-- .-. .. - .. -. --. / - .... . / -.-. --- -.. . .-.-.-\n\n.. / .... .- ...- . / -- -.-- / --- .-- -. / -.. .- - .- -... .- ... . / .... --- ... - . -.. / .. -. / -- --- -. --. --- -.. -... / .- - .-.. .- ... --..-- / .. / ..- ... . / -- --- -. --. --- --- ... . / - --- / .- -.-. -.-. . ... ... / .. - .-.-.-`);
        else await message.channel.send('I am Gidget, a robot created by Widget. I hope to be useful someday!\n\nThe way I communicate with the Discord API is written in JavaScript using Discord.js v' + Discord.version + ', thanks to AndreMor for writing the code.\n\nI have my own database hosted in MongoDB Atlas, I use Mongoose to access it.\n\nVersion ' + global.botVersion + " from shard " + bot.shard.id);
    }
}