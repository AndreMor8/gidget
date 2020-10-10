import Command from "../../utils/command.js";

import Discord from 'discord.js';

import cheerio from 'cheerio';

import fetch from 'node-fetch';

export default class extends Command {
  constructor(options) {
    super(options);
    this.aliases = [];
    this.description = "Random Walden Image";
    this.permissions = {
      user: [0, 0],
      bot: [0, 16384]
    }
  }
  async run(message, args) {
    await image(message);
  }
}
async function image(message) {
  var options = {
    method: "GET",
    headers: {
      Accept: "text/html",
      "User-Agent": "Chrome"
    }
  };

  const response = await fetch(
    "http://results.dogpile.com/serp?qc=images&q=" + "wow wow wubbzy walden",
    options
  );
  const responseBody = await response.text();
  let $ = cheerio.load(responseBody);

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
    .setTitle("Random Walden Image")
    .setImage(rimg);
  await message.channel.send(embed);
}
