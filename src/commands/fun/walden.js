const Discord = require("discord.js");
const Jimp = require("jimp");
module.exports = {
  run: async (bot, message, args) => {
    if (!args[1])
      return message.channel.send("Usage: `walden [<32>/<64>] <text>`");
    if (args[1] === "64") {
      px64(message, args.slice(2));
    } else if (args[1] === "32") {
      px32(message, args.slice(2));
    } else {
      px32(message, args.slice(1));
    }
  },
  aliases: [],
  description: "Walden",
  permissions: {
    user: [0, 0],
    bot: [0, 32768]
  }
};

async function px32(message, args) {
  if (!args[0])
    return message.channel.send("Usage: `walden [<32>/<64>] <text>`");
  if (args.join(" ").length > 80)
    return message.channel.send("There's a 80 characters limit.");
  message.channel.startTyping();
  let font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);
  let meme = await Jimp.read(
    "https://cdn.glitch.com/9215ce3e-8f9b-4577-9468-e5a34523fe98%2Fwalden-says-5d018d79327df.png?v=1590048195907"
  );
  let pre_text = args.join(" ").split("");
  let realtext = "";
  let post_text = "";
  for (let i = 0; i < pre_text.length; i++) {
    post_text += pre_text[i];
    if (pre_text[i] === " ") {
      post_text = " ";
      continue;
    }
    if (post_text.length > 12) {
      realtext += " " + pre_text[i];
      post_text = " ";
    } else {
      realtext += pre_text[i];
    }
  }
  meme.print(
    font,
    403,
    20,
    {
      text: realtext,
      alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
      alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE
    },
    263,
    249
  );

  let render = await meme.getBufferAsync(Jimp.MIME_PNG);

  const attachment = new Discord.MessageAttachment(render, "walden.png");
  await message.channel.send(attachment);
  message.channel.stopTyping();
}

async function px64(message, args) {
  if (!args[0])
    return message.channel.send("Usage: `walden [<32>/<64>] <text>`");
  if (args.join(" ").length > 16)
    return message.channel.send("There's a 16 characters limit.");
  message.channel.startTyping();
  let font = await Jimp.loadFont(Jimp.FONT_SANS_64_BLACK);
  let meme = await Jimp.read(
    "https://cdn.glitch.com/9215ce3e-8f9b-4577-9468-e5a34523fe98%2Fwalden-says-5d018d79327df.png?v=1590048195907"
  );
  let pre_text = args.join(" ").split("");
  let realtext = "";
  let post_text = "";
  for (let i = 0; i < pre_text.length; i++) {
    post_text += pre_text[i];
    if(pre_text[i] === " ") {
      post_text = " ";
      continue;
    }
    if (post_text.length > 6) {
      realtext += " " + pre_text[i];
      post_text = " ";
    } else {
      realtext += pre_text[i];
    }
  }
  meme.print(
    font,
    382,
    15,
    {
      text: realtext,
      alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
      alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE
    },
    300,
    260
  );

  let render = await meme.getBufferAsync(Jimp.MIME_PNG);

  const attachment = new Discord.MessageAttachment(render, "walden.png");
  await message.channel.send(attachment);
  message.channel.stopTyping();
}
