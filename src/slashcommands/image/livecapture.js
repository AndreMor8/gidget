import { MessageAttachment } from 'discord.js';
import ytdl from '@distube/ytdl-core';
import fs from 'fs';
import { join } from 'path';
import crypto from 'crypto';
import commons from '../../utils/commons.js';
import execa from 'execa';
import ffmpeg from 'ffmpeg-static';
const timer = new Set();
const { __dirname } = commons(import.meta.url);
export default class extends SlashCommand {
  constructor(options) {
    super(options);
    this.deployOptions.description = "Take a screenshot from a live YouTube stream.";
    this.deployOptions.options = [
      {
        name: "video",
        type: "STRING",
        description: "The live video you want to screenshot",
        required: true
      }
    ];
    this.permissions = {
      user: [0n, 0n],
      bot: [0n, 32768n]
    }
  }
  async run(bot, interaction) {
    //Check valid YouTube URL
    const check = ytdl.validateURL(interaction.options.getString("video", true)) || ytdl.validateID(interaction.options.getString("video", true));
    if (!check) return interaction.reply("Invalid URL!");
    //Cooldown
    if (interaction.user.id !== "577000793094488085") {
      if (!timer.has(interaction.user.id)) {
        timer.add(interaction.user.id);
        setTimeout(() => {
          timer.delete(interaction.user.id);
        }, 60000);
      } else {
        return interaction.reply({ content: "Don't overload this command! (1 min cooldown)", ephemeral: true });
      }
    }
    //Obtain video information
    const info = await ytdl.getBasicInfo(interaction.options.getString("video"));
    //Check if is live video
    if (info.videoDetails.lengthSeconds != 0) return interaction.reply("This isn't a live stream video!");
    try {
      //Download the video
      const stream = ytdl(interaction.options.getString("video"), { filter: "videoandaudio" });
      //Return a Promise
      return await new Promise((s, r) => {
        //Some random name for the temp file
        const name = crypto.randomBytes(20).toString('hex');
        //Paths
        const pathMP4 = join(__dirname, '../../tmp', `/${name}.mp4`);
        const pathPNG = join(__dirname, '../../tmp', `/${name}.png`);
        //Create a MP4 file
        const file = fs.createWriteStream(pathMP4);
        //Put data on it.
        stream.pipe(file);
        //Loading...
        interaction.deferReply();
        //Any download error
        stream.on("error", () => {
          interaction.editReply("Looks like this video isn't compatible with FFMPEG :(");
          s();
        });
        stream.on('progress', (a, b) => {
          //I only need some seconds of the live video
          if (b == 3) {
            //Stop downloading
            stream.destroy();
            //End file
            file.close();
            //Execute FFMPEG to capture this.
            execa(ffmpeg, ['-i', pathMP4, '-vframes', '1', pathPNG])
              //All correct.
              .then(async () => {
                //Read file
                const buf = await fs.promises.readFile(pathPNG);
                //Send to Discord
                const att = new MessageAttachment(buf, "image.png");
                await interaction.editReply({ files: [att] });
                s();
              })
              //Any errors here
              .catch(r)
              //When this ends
              .finally(() => {
                fs.promises.unlink(pathMP4).catch(() => { });
                fs.promises.unlink(pathPNG).catch(() => { });
              });
          }
        });
      });
    } catch (err) {
      //Errors
      if (interaction.replied) interaction.editReply(err.toString());
      else interaction.reply(err.toString());
    }
  }
}
