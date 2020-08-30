const { MessageAttachment } = require('discord.js');
//JIMP es un manipulador de imágenes hecho en puro JavaScript. No necesitas construir C++ en node-gyp ni nada de esas cosas
//JavaScript Image Manipulation Program
const Jimp = require("jimp");

module.exports = {
    run: async (bot = new Discord.Client(), message = new Discord.Message(), args = []) => {
    //Fallback
    if(!args[1]) return message.channel.send("Pon algo");
    //Cargamos una fuente. La fuente que acabo de cargar es una fuente por default de JIMP. Este método devuelve promesa con la fuente
    let font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);
    //Cargamos la imagen (en este caso la imagen de Trump sosteniendo un libro). Devuelve promesa con los métodos para manipular la imagen
    //Esta es sólo una URL de prueba. Te recomiendo usar FS y sacar el buffer de un archivo de esa manera siempre tenerlo.
    let meme = await Jimp.read("https://media.discordapp.net/attachments/359425464885837827/593819763797393438/TrumpApi.png");
    //Para hacer una nueva linea cada vez que "una sóla palabra" exceda X límite usaremos esta función.
    const realtext = getWellText(args.slice(1).join(" "), 14, 88);
    //Para hacer que el texto vaya a la misma dirección que la posición del libro voy a rotar la imagen 7 grados a la izquierda
    meme.rotate(7);
    //Imprimimos este texto. Las dimensiones que se ven aquí están adaptadas a la imagen de la URL puesta arriba.
    /*
    1º parámetro: Fuente que se usará para imprimir el texto
    2º parámetro: Posición X/horizontal donde estará el texto
    3º parámetro: Posición Y/vertical donde irá el texto
    4º parámetro: Texto a poner, o un objeto con el texto y alineamientos si así se desea
    5º parámetro: Longitud horizontal a alcanzar antes de hacer salto de linea (wrap)
    */
    meme.print(font, 670, 320, realtext, 260);
    //Rotamos de nuevo la imagen, 7 grados a la derecha, pero esta vez sin cambiar la resolución de la imagen
    meme.rotate(-7, false);
    //Quitar el borde transparente automáticamente.
    meme.autocrop();
    //Con todos los métodos que hemos hecho para poner el texto, creamos el buffer. Devuelve promesa con el buffer que sería la imagen modificada
    let render = await meme.getBufferAsync(Jimp.MIME_PNG);
    //Creamos el archivo adjunto listo para enviar a Discord
    const attachment = new MessageAttachment(render, "trump.png");
    //Enviamos un mensaje con el archivo
    await message.channel.send(attachment);
    },
    aliases: [],
    secret: true,
    description: 'Some console.log tests',
    permissions: {
    user: [0, 0],
    bot: [0, 32768]
  }
}

/**
 * Obtener un texto con los saltos de linea correctos cuando una sóla palabra excede el límite especificado
 * @param {String} text El texto a revisar
 * @param {Number} maxWordLength Longitud que debe tener la palabra antes de dividirla y hacer salto de linea
 * @param {Number} maxTextLength Si el texto resultante es mayor a esta longuitud, detener el bucle
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