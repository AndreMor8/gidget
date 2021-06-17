let font;
const WIDTH = 1024
const HEIGHT = 768
import path from 'path';
import commons from '../../utils/commons.js';
const { __dirname } = commons(import.meta.url);
import Jimp from 'jimp';

import { MessageAttachment } from 'discord.js';
export default class extends Command {
  constructor(options) {
    super(options);
    this.description = "Generate a text with the House Holiday Sans font, the font that some Wubbzy products and pages used.";
    this.permissions = {
      user: [0n, 0n],
      bot: [0n, 32768n]
    }
  }
  async run(bot, message, args) {
    if (!args[1]) return message.channel.send("Put something");
    if (args.slice(1).join(" ").length > 120) return message.channel.send("There's a 120 characters limit.");
    message.channel.startTyping();
    if (!font) font = await Jimp.loadFont(path.join(__dirname, "/../../assets/", "font.fnt"));
    const image = new Jimp(WIDTH, HEIGHT);
    image.print(font, 0, 0, {
      text: getWellText(args.slice(1).join(" "), 19, 120),
      alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
      alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE
    }, WIDTH, HEIGHT);
    const buf = await image.getBufferAsync(Jimp.MIME_PNG);
    const att = new MessageAttachment(buf, "wubbtext.png");
    message.channel.stopTyping(true);
    await message.channel.send({ files: [att] });
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
  //Dos variables que serán responsables de manejar el texto durante el for
  let realtext = "", post_text = "";
  //Bucle for, con variable i = 0, cada instancia hace i++, se mantendrá ejecutando mientras i < la longitud del texto
  for (let i = 0; i < text.length; i++) {
    //Si el texto creado es mayor al límite de oración especificado, detener el bucle
    if (realtext.length > maxTextLength) break;
    //Revisar palabra. Vamos agregando un caracter a esta variable
    //No crean que porque acepta corchetes es un array. text es un string
    post_text += text[i];
    //Si el carácter es un espacio....
    if (text[i] === " ") {
      //La palabra a revisar cambia a un espacio
      post_text = " ";
      //realtext no cambia
      realtext += text[i];
      //Detener esta instancia y seguir el bucle...
      continue;
    }
    //Si la longuitud de la palabra a revisar es mayor a la longuitud de palabra especificado....
    if (post_text.length > maxWordLength) {
      //El texto que será enviado a imprimir (realtext) se le agregará 1 espacio y el carácter
      realtext += " " + text[i];
      //La palabra a revisar cambia a un espacio
      post_text = " ";
    } else {
      //Si no es mayor, simplemente agregar el carácter al texto a imprimir
      realtext += text[i];
    }
  }
  //Cuando el bucle termine retornar realtext, el texto a imprimir.
  return realtext;
}
