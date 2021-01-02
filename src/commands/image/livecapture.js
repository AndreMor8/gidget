import { MessageAttachment } from 'discord.js';
import ytdl from 'ytdl-core';
import fs from 'fs';
import { join } from 'path';
import cp from 'child_process';
import commons from '../../utils/commons.js';
import ffmpeg from 'ffmpeg-static';
import crypto from 'crypto';
const timer = new Set();
const { __dirname } = commons(import.meta.url);
export default class extends Command {
  constructor(options) {
    super(options)
    this.description = "Take a screenshot from a live YouTube stream.";
    this.permissions = {
      user: [0, 0],
      bot: [0, 32768]
    }
  }
  async run(bot, message, args) {
    if (!args[1]) return message.channel.send("Put a live stream video from YouTube");
    const check = ytdl.validateURL(args[1]) || ytdl.validateID(args[1]);
    if (!check) return message.channel.send("Invalid URL!");
    if (message.author.id !== "577000793094488085") {
      if (!timer.has(message.author.id)) {
        timer.add(message.author.id);
        setTimeout(() => {
          timer.delete(message.author.id);
        }, 60000);
      } else {
        return message.channel.send("Don't overload this command! (1 min cooldown)");
      }
    }
    message.channel.startTyping();
    const info = await ytdl.getBasicInfo(args[1]);
    if (info.videoDetails.lengthSeconds != 0) return message.channel.send("This isn't a live stream video!");
    const name = crypto.randomBytes(20).toString('hex');
    const path = join(__dirname, '../../tmp', `/${name}.mp4`);
    const file = fs.createWriteStream(path);
    const stream = ytdl(args[1], { filter: format => format.container === 'mp4' });
    stream.pipe(file);
    return new Promise((s) => {
      stream.on('progress', (a, b) => {
        if (b == 3) {
          stream.destroy();
          file.close();
          cp.spawn(ffmpeg, ['-i', path, '-vframes', '1', join(__dirname, '../../tmp', `/${name}.png`)]).on('close', async () => {
            const buf = await fs.promises.readFile(join(__dirname, '../../tmp', `/${name}.png`));
            const att = new MessageAttachment(buf, "image.png");
            await message.channel.send(att);
            await fs.promises.unlink(join(__dirname, '../../tmp', `/${name}.png`));
            await fs.promises.unlink(join(__dirname, '../../tmp', `/${name}.mp4`));
            message.channel.stopTyping(true);
            s();
          });
        }
      })
    })
  }
}
