const Discord = require("discord.js");

const cheerio = require("cheerio");

const fetch = require('node-fetch');

module.exports = {
  run: async (bot, message, args) => {
    image(message);
  },
  aliases: [],
  description: "Random Widget Image"
};

async function image(message) {
  var options = {
    method: "GET",
    headers: {
      Accept: "text/html",
      "User-Agent": "Chrome"
    }
  };

  const response = await fetch(
    "http://results.dogpile.com/serp?qc=images&q=" + "wow wow wubbzy widget",
    options
  );
  const responseBody = await response.text();
  $ = cheerio.load(responseBody);

  $ = cheerio.load(responseBody);

  var links = $(".image a.link");

  var urls = new Array(links.length)
    .fill(0)
    .map((v, i) => links.eq(i).attr("href"));

  if (!urls.length) {
    return;
  }

  var rimg = urls[Math.floor(Math.random() * urls.length)];

  // Send result
  const embed = new Discord.MessageEmbed()
    .setTitle("Random Widget Image")
    .setImage(rimg);
  message.channel.send(embed);
}
