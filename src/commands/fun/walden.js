import path from 'path';
import commons from '../../utils/commons.js';
const { __dirname } = commons(import.meta.url);
import Discord from 'discord.js';
import Jimp from 'jimp';
let font;
export default class extends Command {
  constructor(options) {
    super(options);
    this.description = "Walden";
    this.permissions = {
      user: [0n, 0n],
      bot: [0n, 32768n]
    }
  }
  async run(bot, message, args) {
    if (!args[1])
      return message.channel.send("Usage: `walden [<32>/<64>] <text>`");
    if (args[1] === "64") {
      await px64(message, args.slice(2));
    } else if (args[1] === "32") {
      await px32(message, args.slice(2));
    } else {
      await px32(message, args.slice(1));
    }
  }
}

async function px32(message, args) {
  if (!args[0])
    return message.channel.send("Usage: `walden [<32>/<64>] <text>`");
  if (args.join(" ").length > 80)
    return message.channel.send("There's a 80 characters limit.");
  message.channel.startTyping();
  if (!font) font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);
  const meme = await Jimp.read(path.join(__dirname, "../../assets/walden-says.png"));
  const pre_text = args.join(" ").split("");
  let realtext = "";
  let post_text = "";
  for (let i = 0; i < pre_text.length; i++) {
    post_text += pre_text[i];
    if (pre_text[i] === " ") {
      post_text = " ";
      realtext += pre_text[i];
      continue;
    }
    if (post_text.length > 14) {
      realtext += " " + pre_text[i];
      post_text = " ";
    } else {
      realtext += pre_text[i];
    }
  }
  meme.print(font, 403, 20, {
    text: realtext,
    alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
    alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE
  }, 263, 249);

  const render = await meme.getBufferAsync(Jimp.MIME_PNG);

  const attachment = new Discord.MessageAttachment(render, "walden.png");
  await message.channel.send({ files: [attachment] });
  message.channel.stopTyping();
}

async function px64(message, args) {
  if (!args[0])
    return message.channel.send("Usage: `walden [<32>/<64>] <text>`");
  if (args.join(" ").length > 16)
    return message.channel.send("There's a 16 characters limit.");
  message.channel.startTyping();
  if (!font) font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);
  const meme = await Jimp.read(path.join(__dirname, "../../assets/walden-says.png"));
  const pre_text = args.join(" ").split("");
  let realtext = "";
  let post_text = "";
  for (let i = 0; i < pre_text.length; i++) {
    post_text += pre_text[i];
    if (pre_text[i] === " ") {
      post_text = " ";
      realtext += pre_text[i];
      continue;
    }
    if (post_text.length > 6) {
      realtext += " " + pre_text[i];
      post_text = " ";
    } else {
      realtext += pre_text[i];
    }
  }
  meme.print(font, 382, 15, {
    text: realtext,
    alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
    alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE
  }, 300, 260);

  const render = await meme.getBufferAsync(Jimp.MIME_PNG);

  const attachment = new Discord.MessageAttachment(render, "walden.png");
  await message.channel.send({ files: [attachment] });
  message.channel.stopTyping();
}
