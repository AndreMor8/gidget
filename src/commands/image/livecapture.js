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
    this.aliases = ["lc"];
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
    const info = await ytdl.getBasicInfo(args[1]);
    if (info.videoDetails.lengthSeconds != 0) return message.channel.send("This isn't a live stream video!");
    try {
      const stream = ytdl(args[1], { filter: "videoandaudio" });
      return new Promise((s, r) => {
        const name = crypto.randomBytes(20).toString('hex');
        const path = join(__dirname, '../../tmp', `/${name}.mp4`);
        const file = fs.createWriteStream(path);
        stream.pipe(file);
        message.channel.startTyping();
        stream.on("error", async () => {
          message.channel.stopTyping();
          message.channel.send("Looks like this video isn't compatible with FFMPEG :(");
          await fs.promises.unlink(join(__dirname, '../../tmp', `/${name}.mp4`)).catch(() => {});
          s();
        });
        stream.on('progress', (a, b) => {
          if (b == 3) {
            stream.destroy();
            file.close();
            cp.spawn(ffmpeg, ['-i', path, '-vframes', '1', join(__dirname, '../../tmp', `/${name}.png`)]).on('close', async () => {
              const buf = await fs.promises.readFile(join(__dirname, '../../tmp', `/${name}.png`));
              const att = new MessageAttachment(buf, "image.png");
              await message.channel.send(att);
              await fs.promises.unlink(join(__dirname, '../../tmp', `/${name}.png`)).catch(() => {});
              await fs.promises.unlink(join(__dirname, '../../tmp', `/${name}.mp4`)).catch(() => {});
              message.channel.stopTyping(true);
              s();
            }).on("error", r);
          }
        })
      })
    } catch (err) {
      message.channel.send(err.toString());
    }
  }
}
