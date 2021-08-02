/*
Copied from https://benisland.neocities.org/petpet/index.js (code for web browsers)
Adapted for use with servers (Node.js)
Sprite: https://benisland.neocities.org/petpet/img/sprite.png
*/
import path from 'path';
import commons from "./commons.js";
const { __dirname } = commons(import.meta.url);
import Canvas from 'canvas';
let sprite;
import GIF from "gif-encoder";
const SIZE = 112;
const g = {
  delay: 63,
  x: 18,
  y: 18,
  w: 112,
  h: 112,
  scale: 0.875,
  frame: 0,
};
const getFrame = (i) =>
  [{
      x: g.x,
      y: g.y,
      w: g.w * g.scale,
      h: g.h * g.scale,
    }, {
      x: g.x - 4,
      y: g.y + 12,
      w: g.w * g.scale + 4,
      h: g.h * g.scale - 12,
    }, {
      x: g.x - 12,
      y: g.y + 18,
      w: g.w * g.scale + 12,
      h: g.h * g.scale - 18,
    }, {
      x: g.x - 12,
      y: g.y + 12,
      w: g.w * g.scale + 4,
      h: g.h * g.scale - 12,
    }, {
      x: g.x - 4,
      y: g.y,
      w: g.w * g.scale,
      h: g.h * g.scale,
    },
  ][i];
/**
 * Remove partially transparent & #00ff00 (bg color) green pixels.
 */
function optimizeFrameColors(data) {
  for (let i = 0; i < data.length; i += 4) {
    // clamp greens to avoid pure greens from turning transparent
    data[i + 1] = data[i + 1] > 250 ? 250 : data[i + 1];
    // clamp transparency
    data[i + 3] = data[i + 3] > 127 ? 255 : 0;
  }
}
/**
 * Render gif.
 *
 * @param {Canvas.Image} sprite 
 * @param {Canvas.Image} character 
 * @param {Array} frames 
 * @param {number} size 
 * @param {number} delay
 * @returns {Promise<Buffer>} The new Petpet GIF 
 */
function render(sprite, character, frames, size, delay) {
  return new Promise((s) => {
    // canvas used to render the frames for the gif
    const renderCanvas = Canvas.createCanvas(size, size);
    const renderCtx = renderCanvas.getContext("2d");

    // canvas used to optimize the GIF colors
    const tempCanvas = Canvas.createCanvas(size, size);
    const tempCtx = tempCanvas.getContext("2d");
    renderCanvas.width = renderCanvas.height = tempCanvas.width = tempCanvas.height = size;

    // Renderer
    const gif = new GIF(size, size);
    gif.setDelay(delay);
    gif.setTransparent(0x00ff00);
    gif.setRepeat(0);
    const chunks = [];
    gif.on("data", (b) => chunks.push(b))
    gif.on("end", () => {
      const buffer = Buffer.concat(chunks);
      s(buffer);
    });
    frames.forEach((frameData, frame) => {
      // clear canvases
      tempCtx.clearRect(0, 0, size, size);
      renderCtx.fillStyle = "#0f0";
      renderCtx.fillRect(0, 0, renderCanvas.width, renderCanvas.height);

      // draw frame
      tempCtx.drawImage(character, frameData.x, frameData.y, frameData.w, frameData.h);
      tempCtx.drawImage(sprite, frame * size, 0, size, size, 0, 0, size, size);

      // fix transparency
      const imgData = tempCtx.getImageData(0, 0, renderCanvas.width, renderCanvas.height);
      optimizeFrameColors(imgData.data);
      tempCtx.putImageData(imgData, 0, 0);

      // add frame to gif
      renderCtx.drawImage(tempCanvas, 0, 0);
      if(frame == 0) gif.writeHeader();
      gif.addFrame(renderCtx.getImageData(0, 0, renderCanvas.width, renderCanvas.height).data);
    });

    gif.finish();
  })
}

export default async function (toconvert, dy = g.delay) {
  if(!sprite) sprite = await Canvas.loadImage(path.join(__dirname, "../assets/sprite.png"));
  const tosend = await render(sprite, toconvert, [0, 1, 2, 3, 4].map(getFrame), SIZE, dy);
  return tosend;
}
