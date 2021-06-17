import path from 'path';
import commons from '../../utils/commons.js';
const { __dirname } = commons(import.meta.url);
import { MessageAttachment } from 'discord.js';
import Jimp from 'jimp';
let font;
export default class extends Command {
  constructor(options) {
    super(options);
    this.description = 'An image of Trump where he grabs a book with your text.';
    this.permissions = {
      user: [0n, 0n],
      bot: [0n, 32768n]
    }
  }
  async run(bot, message, args) {
    if (!args[1]) return message.channel.send("Put something...");
    message.channel.startTyping();
    if (!font) font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);
    const meme = await Jimp.read(path.join(__dirname, "../../assets/TrumpApi.png"));
    const realtext = getWellText(args.slice(1).join(" "), 14, 88);
    meme.rotate(7);
    meme.print(font, 670, 320, realtext, 260);
    meme.rotate(-7, false);
    meme.autocrop();
    const render = await meme.getBufferAsync(Jimp.MIME_PNG);
    const attachment = new MessageAttachment(render, "trump.png");
    await message.channel.send({ files: [attachment] });
    message.channel.stopTyping();
  }
}

/**
 * Obtener un texto con los saltos de linea correctos cuando una sóla palabra excede el límite especificado.
 *
 * @param {string} text - El texto a revisar.
 * @param {number} maxWordLength - Longitud que debe tener la palabra antes de dividirla y hacer salto de linea.
 * @param {Number} maxTextLength - Si el texto resultante es mayor a esta longuitud, detener el bucle.
 * @returns {String} El texto a imprimir
 */
function getWellText(text, maxWordLength, maxTextLength = Infinity) {
  let realtext = "", post_text = "";
  for (let i = 0; i < text.length; i++) {
    if (realtext.length > maxTextLength) break;
    post_text += text[i];
    if (text[i] === " ") {
      post_text = " ";
      realtext += text[i];
      continue;
    }
    if (post_text.length > maxWordLength) {
      realtext += " " + text[i];
      post_text = " ";
    } else {
      realtext += text[i];
    }
  }
  return realtext;
}