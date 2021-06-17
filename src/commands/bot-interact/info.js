import Discord from 'discord.js';
export default class extends Command {
    constructor(options) {
        super(options);
        this.description = "Info about Gidget in plain text";
    }
    async run(bot, message) {
        //if (args[1] === 'morse')return await message.channel.send(`.. / .- -- / --. .. -.. --. . - --..-- / .- / .-. --- -... --- - / .... --- ... - . -.. / --- -. / --. .-.. .. - -.-. .... --..-- / -.-. .-. . .- - . -.. / -... -.-- / .-- .. -.. --. . - .-.-.- / .. / .... --- .--. . / - --- / -... . / ..- ... . ..-. ..- .-.. / ... --- -- . -.. .- -.-- -.-.--\n\n- .... . / .-- .- -.-- / .. / -.-. --- -- -- ..- -. .. -.-. .- - . / .-- .. - .... / - .... . / -.. .. ... -.-. --- .-. -.. / .- .--. .. / .. ... / .-- .-. .. - - . -. / .. -. / .--- .- ...- .- ... -.-. .-. .. .--. - / ..- ... .. -. --. / -.. .. ... -.-. --- .-. -.. .-.-.- .--- ... / ...- .---- ..--- .-.-.- .---- .-.-.- .---- --..-- / - .... .- -. -.- ... / - --- / .- -. -.. .-. . -- --- .-. / ..-. --- .-. / .-- .-. .. - .. -. --. / - .... . / -.-. --- -.. . .-.-.-\n\n.. / .... .- ...- . / -- -.-- / --- .-- -. / -.. .- - .- -... .- ... . / .... --- ... - . -.. / .. -. / -- --- -. --. --- -.. -... / .- - .-.. .- ... --..-- / .. / ..- ... . / -- --- -. --. --- --- ... . / - --- / .- -.-. -.-. . ... ... / .. - .-.-.-`);
        /*else*/return await message.channel.send('I am Gidget, a robot created by Widget. I hope to be useful someday!\n\nThe way I communicate with the Discord API is written in JavaScript using Discord.js Light v' + Discord.version + ', thanks to AndreMor for writing the code.\n\nI have my own database hosted in MongoDB Atlas, I use Mongoose to access it.\n\nVersion ' + bot.botVersion + " from shard " + (bot.shard?.ids[0] || 0));
    }
}