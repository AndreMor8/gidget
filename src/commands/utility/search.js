const Discord = require('discord.js');
const googleIt = require('google-it');
const b = require("../../utils/badwords");
const badwords = new b();
badwords.setOptions({ whitelist: ["crap"] });
const { checkCleanUrl } = require('../../utils/clean-url/index');
module.exports = {
  run: async (bot, message, args) => {
    if (!args[1]) return message.channel.send('You must send something first.')
    if (badwords.isProfane(args.slice(1).join(" ").toLowerCase()) && !message.channel.nsfw) return message.channel.send("To order this content go to an NSFW channel.")
    message.channel.startTyping();
    googleIt({ 'query': args.slice(1).join(" "), 'limit': 7, disableConsole: true }).then(results => {
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
      message.channel.stopTyping();
      message.channel.send(embed);
    }).catch(e => {
      message.channel.stopTyping(true);
      message.channel.send('Something happened when searching. Here\'s a debug:' + e);
    })
  },
  aliases: [],
  description: "Search in Google",
  permissions: {
    user: [0, 0],
    bot: [0, 16384]
  }
}