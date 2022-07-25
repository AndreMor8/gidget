import parser from 'twemoji-parser';
import svg2img_callback from 'node-svg2img';
import { promisify } from 'util';
import { AttachmentBuilder } from 'discord.js';
import { getBuffer } from '../../extensions.js';
const svg2img = promisify(svg2img_callback);
const regex = /<?(a:|:)\w*:(\d{17,20})>/;

export default class extends Command {
  constructor(options) {
    super(options);
    this.aliases = ["j"];
    this.description = "Expand some emoji :)"
  }
  async run(bot, message, args) {
    if (!args[1]) return message.channel.send("Put some emoji");
    const parsed = parser.parse(args[1]);
    const cachedemoji = message.guild?.emojis.cache.get(args[1]) || message.guild?.emojis.cache.find(e => e.name === args[1]) || bot.emojis.cache.get(args[1]) || bot.emojis.cache.find(e => e.name === args[1]);
    const matched = args[1].match(regex);
    if (matched) {
      const ext = args[1].startsWith("<a:") ? ("gif") : ("png");
      const img = `https://cdn.discordapp.com/emojis/${matched[2]}.${ext}`;
      const att = new AttachmentBuilder(img, { name: matched[2] + "." + ext });
      await message.channel.send({ files: [att] });
    } else if (parsed.length >= 1) {
      const number = parseInt(args[2]);
      const size = number && ((number <= 1024) && (number > 0)) ? number : 150;
      const buf = await svg2img(await getBuffer(parsed[0].url), { extension: "png", width: size, height: size });
      const att = new AttachmentBuilder(buf, { name: "twemoji.png" });
      await message.channel.send({ content: (number ? undefined : "In Twemoji mode you can resize the image up to 1024.\n`jumbo <emoji> [size]`"), files: [att] });
    } else if (cachedemoji) {
      const att = new AttachmentBuilder(cachedemoji.url, { name: cachedemoji.id + (cachedemoji.animated ? ".gif" : ".png") });
      await message.channel.send({ files: [att] });
    } else await message.channel.send("Please put a valid Discord custom o Twemoji/common/Unicode emoji");
  }
}