const Discord = require('discord.js');

const cheerio = require('cheerio');
 
const fetch = require('node-fetch');

module.exports = {
    run: async (bot, message, args) => {
        if (!args[1]) return message.channel.send('First give me a search term.')
        image(message);
    },
    aliases: [],
    description: "Random images",
}

async function image(message){ 

    const args = message.content.split(" ");

    var options = {
        method: "GET",
        headers: {
            "Accept": "text/html",
            "User-Agent": "Chrome"
        }
    };
  
  const response = await fetch("http://results.dogpile.com/serp?qc=images&q=" + args.slice(1).join(" "), options)
  const responseBody = await response.text()
  $ = cheerio.load(responseBody);
    
        var links = $(".image a.link");
    
        var urls = new Array(links.length).fill(0).map((v, i) => links.eq(i).attr("href"));

        if (!urls.length) {
            return message.channel.send("I didn't find anything.");
        }

        let i = 0;
        let max = urls.length - 1;
        const embed = new Discord.MessageEmbed()
        .setTitle("Image search: " + args.slice(1).join(" "))
        .setDescription(`Use the reactions to move from one image to another`)
        .setFooter(`${i + 1}/${max + 1}`)
        .setImage(urls[i])
        .setColor("RANDOM")

        const filter = (reaction, user) => {
            return ['◀️', '▶️', '⏹️'].includes(reaction.emoji.name) && user.id === message.author.id;
        };
        let msg = await message.channel.send(embed);
        await msg.react('◀️');
        await msg.react('▶️');
        await msg.react('⏹️');

        let collector = msg.createReactionCollector(filter, { idle: 20000 })
        collector.on('collect', async (reaction, user) => {
            if (reaction.emoji.name === '▶️') {
              
              if(message.guild && message.channel.permissionsFor(message.client.user).has("MANAGE_MESSAGES")) {
                await reaction.users.remove(user.id);
              } 
                if (max !== i){
                    i++
                    embed.setImage(urls[i])
                    embed.setFooter(`${i + 1}/${max + 1}`)
                    await msg.edit(embed);
                }
            }
            if (reaction.emoji.name === '◀️') {
              if(message.guild && message.channel.permissionsFor(message.client.user).has("MANAGE_MESSAGES")) {
                await reaction.users.remove(user.id);
              } 
                if (i !== 0) {
                    i--
                    embed.setImage(urls[i])
                    embed.setFooter(`${i + 1}/${max + 1}`)
                    await msg.edit(embed);
                }
            }
            if (reaction.emoji.name === '⏹️') {
                collector.stop();
            }
        })
        collector.on('end', collected => {
         if(message.guild && message.channel.permissionsFor(message.client.user).has("MANAGE_MESSAGES")) {msg.reactions.removeAll()}})
  
};