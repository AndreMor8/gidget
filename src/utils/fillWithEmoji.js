//Copied from https://www.npmjs.com/package/discord-emoji-canvas / https://github.com/abh80/discord-emoji-canvas
import Canvas from "canvas";
import { parse } from "twemoji-parser";
import { getBuffer } from "../extensions.js";
export default async (ctx, text, x, y) => {
  if (!ctx) throw new Error(`(discord-emoji-canvas) No Context was provided`);
  if (!text) throw new Error("(discord-emoji-canvas) No Text was provided");
  if (!x) throw new Error(`(discord-emoji-canvas) No x axis was provided`);
  if (!y) throw new Error(`(discord-emoji-canvas) No y axis was provided`);

  const emojiPercent1 = 0.1;
  const emojiPercent2 = 0.1;
  const fontSize = parseInt(ctx.font.replace(/[^\d.]/g, ''))
  const emojiSideMargin = fontSize * emojiPercent1;
  const emojiUpMargin = fontSize * emojiPercent2;
  const entity = text.split(" ");
  const baseLine = ctx.measureText("").alphabeticBaseline;
  let currWidth = 0;
  for (let i = 0; i < entity.length; i++) {
    //starting loop
    const ent = entity[i]; //getting current word or emoji
    const parsed = parse(ent); //parsing to check later if emote is an twemoji
    //checking if custom emote or not
    const matched = ent.match(/<?(a:|:)\w*:(\d{17}|\d{18})>/);
    if (matched) {
      const img = await Canvas.loadImage(await getBuffer(`https://cdn.discordapp.com/emojis/${matched[2]}.png`));
      ctx.drawImage(img, x + currWidth + emojiSideMargin, y + emojiUpMargin - fontSize - baseLine, fontSize, fontSize);
      currWidth += fontSize + emojiSideMargin * 2 + fontSize / 5;
    } else if (parsed.length > 0) {
      //checking if twemoji or not
      const img = await Canvas.loadImage(parsed[0].url);
      ctx.drawImage(img, x + currWidth + emojiSideMargin, y + emojiUpMargin - fontSize - baseLine, fontSize, fontSize);
      currWidth += fontSize + emojiSideMargin * 2 + fontSize / 5;
    } else {
      //if string
      ctx.fillText(ent, x + currWidth, y);
      currWidth += ctx.measureText(ent).width + fontSize / 5;
    }
  }
};