import Command from '../../utils/command.js';
import Discord from 'discord.js';
import googleIt from 'google-it';
import b from "../../utils/badwords.js";
const badwords = new b();
badwords.setOptions({ whitelist: ["crap"] });
import { checkCleanUrl } from '../../utils/clean-url/index.js';
export default class extends Command {
  constructor(options) {
    super(options)
    this.description = "Search in Google";
    this.permissions = {
      user: [0, 0],
      bot: [0, 16384]
    };
  }
  async run(bot, message, args) {
    if (!args[1]) return message.channel.send('You must send something first.')
    if (badwords.isProfane(args.slice(1).join(" ").toLowerCase()) && !message.channel.nsfw) return message.channel.send("To order this content go to an NSFW channel.")
    message.channel.startTyping();
    const results = await googleIt({ 'query': args.slice(1).join(" "), 'limit': 7, disableConsole: true });
    if (results.some(e => checkCleanUrl(e.link)) && !message.channel.nsfw) {
      message.channel.stopTyping(true);
      return message.channel.send("Your search includes NSFW content. To order this content go to an NSFW channel.");
    }
    if (results.some(e => (badwords.isProfane(e.title.toLowerCase()) || badwords.isProfane(e.snippet.toLowerCase()))) && !message.channel.nsfw) {
      message.channel.stopTyping(true);
      return message.channel.send("Your search includes NSFW content. To order this content go to an NSFW channel.");
    }
    let text = '';
    let i = 0;
    for (const elements of Object.values(results)) {
      i++
      text += `${i}. [${elements.title}](${elements.link})\n${elements.snippet}\n\n`
    }
    let embed = new Discord.MessageEmbed()
      .setAuthor(message.author.username, message.author.displayAvatarURL({ dynamic: true }))
      .setColor('RANDOM')
      .setTitle('Google Search Results')
      .setDescription(text)
      .setFooter('Powered by Google-it')
      .addField('Link', 'https://www.google.com/search?q=' + args.slice(1).join("+"), true)
      .addField('Time', ((Date.now() - message.createdTimestamp) / 1000) + 's', true)
      .setTimestamp();
    message.channel.stopTyping(true);
    await message.channel.send(embed);
  }
}