import { MessageAttachment } from 'discord.js';
import ytdl from 'ytdl-core';
import fs from 'fs';
import { join } from 'path';
import crypto from 'crypto';
import commons from '../../utils/commons.js';
import execa from 'execa';
import ffmpeg from 'ffmpeg-static';
const timer = new Set();
const { __dirname } = commons(import.meta.url);
export default class extends Command {
  constructor(options) {
    super(options)
    this.description = "Take a screenshot from a live YouTube stream.";
    this.aliases = ["lc"];
    this.permissions = {
      user: [0n, 0n],
      bot: [0n, 32768n]
    }
  }
  async run(bot, message, args) {
    //Fallback
    if (!args[1]) return message.channel.send("Put a live stream video from YouTube");
    //Check valid YouTube URL
    const check = ytdl.validateURL(args[1]) || ytdl.validateID(args[1]);
    if (!check) return message.channel.send("Invalid URL!");
    //Cooldown
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
    //Obtain video information
    const info = await ytdl.getBasicInfo(args[1]);
    //Check if is live video
    if (info.videoDetails.lengthSeconds != 0) return message.channel.send("This isn't a live stream video!");
    try {
      //Download the video
      const stream = ytdl(args[1], { filter: "videoandaudio" });
      //Return a Promise
      return await new Promise((s, r) => {
        //Some random name for the temp file
        const name = crypto.randomBytes(20).toString('hex');
        //Paths
        const pathMP4 = join(__dirname, '../../tmp', `/${name}.mp4`);
        const pathPNG = join(__dirname, '../../tmp', `/${name}.png`);
        //Create a MP4 file
        const file = fs.createWriteStream(pathMP4);
        //Put data on it.
        stream.pipe(file);
        //Loading...
        message.channel.startTyping();
        //Any download error
        stream.on("error", () => {
          message.channel.stopTyping();
          message.channel.send("Looks like this video isn't compatible with FFMPEG :(");
          s();
        });
        stream.on('progress', (a, b) => {
          //I only need some seconds of the live video
          if (b == 3) {
            //Stop downloading
            stream.destroy();
            //End file
            file.close();
            //Execute FFMPEG to capture this.
            execa(ffmpeg, ['-i', pathMP4, '-vframes', '1', pathPNG])
              //All correct.
              .then(async () => {
                //Read file
                const buf = await fs.promises.readFile(pathPNG);
                //Send to Discord
                const att = new MessageAttachment(buf, "image.png");
                await message.channel.send({ files: [att] });
                s();
              })
              //Any errors here
              .catch(r)
              //When this ends
              .finally(() => {
                fs.promises.unlink(pathMP4).catch(() => { });
                fs.promises.unlink(pathPNG).catch(() => { });
                message.channel.stopTyping(true);
              });
          }
        });
      });
    } catch (err) {
      //Errors
      message.channel.send(err.toString());
    }
  }
}
