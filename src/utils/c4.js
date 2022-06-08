//See src/commands/fun/c4.js for copyright notices
import path from 'path';
import Canvas from 'canvas';
import GIFEncoder from 'gif-encoder';
import commons from './commons.js';
const { __dirname } = commons(import.meta.url);
let images = [Canvas.loadImage(path.join(__dirname, "../assets/morado_de_4.png")),
Canvas.loadImage(path.join(__dirname, "../assets/4enraya.png")),
Canvas.loadImage(path.join(__dirname, "../assets/rojo_de_cuatro.png")),
Canvas.loadImage(path.join(__dirname, "../assets/amarillo_de_cuatro.png"))];
export function displayBoard(board) {
  const regex = /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g;
  const res = board
    .split('1').join('🟢')
    .split('2').join('🟡')
    .split(' - ').join('⬛')
    .split('---------------------')
    .join('')
    .split('[0]')[0]
    .split(' ').join('')
    .split('\n')
    .filter(item => item.length)
    .map(a => a.match(regex))
  return res;

}
export function displayConnectFourBoard(mapa, game) {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (s) => {
    if (images.find(e => {
      return (e instanceof Promise);
    })) images = await Promise.all(images);
    const win = images[0]
    const bck = images[1]
    const imgs = {
      "🟢": images[2],
      "🟡": images[3]
    };
    const gif = new GIFEncoder(700, 600);
    gif.setRepeat(-1);
    gif.setDelay(200);
    const chunks = [];
    gif.on("data", (b) => chunks.push(b))
    gif.on("end", () => {
      const buffer = Buffer.concat(chunks);
      s(buffer);
    });
    mapa = mapa.map(a => a.map(e => e.replace('⬛', '⚪')))
    const canvas = Canvas.createCanvas(700, 600)
    const ctx = canvas.getContext('2d')
    ctx.drawImage(bck, 0, 0, 700, 600)
    const columna = {
      "0": 10,
      "1": 110,
      "2": 210,
      "3": 310,
      "4": 410,
      "5": 510,
      "6": 610,
    },
      fila = {
        "0": 10,
        "1": 110,
        "2": 210,
        "3": 310,
        "4": 410,
        "5": 510
      },
      filaR = {
        "0": 510,
        "1": 410,
        "2": 310,
        "3": 210,
        "4": 110,
        "5": 10
      }

    let numero = 0;
    for (const i of mapa) {
      let lugar = 0;
      for (const j of i) {
        if (imgs[j]) {
          ctx.drawImage(imgs[j], columna[lugar] + 10, fila[numero] + 10, 50, 50)
        } lugar++
      }
      numero++
    }
    gif.writeHeader();
    gif.addFrame(ctx.getImageData(0, 0, canvas.width, canvas.height).data);

    if (game.solution) {
      for (const i of game.solution) ctx.drawImage(win, columna[i.column] + 10, filaR[i.spacesFromBottom] + 10, 50, 50)
      gif.addFrame(ctx.getImageData(0, 0, canvas.width, canvas.height).data);
      for (const i of game.solution) ctx.drawImage(game.winner == 1 ? imgs['🟢'] : imgs['🟡'], columna[i.column] + 10, filaR[i.spacesFromBottom] + 10, 50, 50)
      gif.addFrame(ctx.getImageData(0, 0, canvas.width, canvas.height).data);
      for (const i of game.solution) ctx.drawImage(win, columna[i.column] + 10, filaR[i.spacesFromBottom] + 10, 50, 50)
      gif.addFrame(ctx.getImageData(0, 0, canvas.width, canvas.height).data);
    }
    gif.finish();
  })
}