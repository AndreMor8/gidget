import { MessageActionRow, MessageButton, MessageEmbed } from 'discord.js';
import googleIt from 'google-it';
import { checkCleanUrl } from '../../utils/clean-url.js';

export default class extends Command {
  constructor(options) {
    super(options)
    this.description = "Search in Google";
    this.aliases = ["google"];
    this.permissions = {
      user: [0n, 0n],
      bot: [0n, 16384n]
    };
  }
  async run(bot, message, args) {
    if (!args[1]) return message.channel.send('You must send something first.')
    if (bot.badwords.isProfane(args.slice(1).join(" ").toLowerCase()) && !message.channel.nsfw) return message.channel.send("To order this content go to an NSFW channel.")
    message.channel.startTyping();

    const results = await googleIt({ 'query': args.slice(1).join(" "), 'limit': 7, disableConsole: true });

    if (results.some(e => checkCleanUrl(e.link)) && !message.channel.nsfw) {
      message.channel.stopTyping(true);
      return message.channel.send("Your search includes NSFW content. To order this content go to an NSFW channel.");
    }
    if (results.some(e => (bot.badwords.isProfane(e.title.toLowerCase()) || bot.badwords.isProfane(e.snippet.toLowerCase()))) && !message.channel.nsfw) {
      message.channel.stopTyping(true);
      return message.channel.send("Your search includes NSFW content. To order this content go to an NSFW channel.");
    }
    let text = '';
    let i = 0;
    for (const elements of Object.values(results)) {
      i++
      const toadd = `${i}. [${elements.title}](${elements.link})\n${elements.snippet}\n\n`;
      if ((text.length + toadd.length) > 2040) break;
      text += toadd;
    }
    const embed = new MessageEmbed()
      .setAuthor(message.author.username, message.author.displayAvatarURL({ dynamic: true }))
      .setColor('RANDOM')
      .setTitle('Google Search Results')
      .setDescription(text)
      .setFooter('Powered by Google-it')
      .addField('Time', ((Date.now() - message.createdTimestamp) / 1000) + 's', true)
      .setTimestamp();
    const but_link_google = new MessageButton()
      .setStyle("LINK")
      .setURL(`https://www.google.com/search?q=${args.slice(1).join("+")}`)
      .setLabel("Google search link");
    message.channel.stopTyping(true);
    await message.channel.send({ embeds: [embed], components: [new MessageActionRow().addComponents([but_link_google])] });
  }
}