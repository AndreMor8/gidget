import { AttachmentBuilder } from 'discord.js';
import { isURL } from '../../extensions.js';
import fs from 'fs';
import { join } from 'path';
import crypto from 'crypto';
import commons from '../../utils/commons.js';
import { execa, execaCommand } from 'execa';
import ffmpeg from 'ffmpeg-static';
const timer = new Set();
const { __dirname } = commons(import.meta.url);
export default class extends SlashCommand {
  constructor(options) {
    super(options);
    this.deployOptions.description = "Take a screenshot from a live stream.";
    this.deployOptions.options = [
      {
        name: "video",
        type: 3,
        description: "The live video you want to screenshot",
        required: true
      }
    ];
    this.permissions = {
      user: [0n, 0n],
      bot: [0n, 32768n]
    }
  }
  async run(bot, interaction) {
    //Check valid URL
    const check = isURL(interaction.options.getString("video", true));
    if (!check) return await interaction.reply("Invalid URL!");
    //Cooldown
    if (interaction.user.id !== "577000793094488085") {
      if (!timer.has(interaction.user.id)) {
        timer.add(interaction.user.id);
        setTimeout(() => {
          timer.delete(interaction.user.id);
        }, 60000);
      } else {
        return await interaction.reply({ content: "Don't overload this command! (1 min cooldown)", ephemeral: true });
      }
    }
    try {
      //Some random name for the temp file
      const name = crypto.randomBytes(20).toString('hex');
      //Paths
      const pathTS = join(__dirname, '../../tmp', `/${name}.ts`);
      const pathPNG = join(__dirname, '../../tmp', `/${name}.png`);
      await interaction.deferReply();
      //Create a TS file
      const stl = execaCommand(`streamlink -o ${pathTS} ${interaction.options.getString("video", true)} best`, { reject: false })
      stl.then(async (a) => {
        if (a.stdout.includes("error")) return await interaction.editReply("Link isn't a live stream, stream not available, or incompatible stream.");
        await execa(ffmpeg, ['-i', pathTS, '-vframes', '1', pathPNG])
          //All correct.
          .then(async () => {
            //Read file
            const buf = await fs.promises.readFile(pathPNG);
            //Send to Discord
            const att = new AttachmentBuilder(buf, { name: "image.png" });
            await interaction.editReply({ files: [att] });
          })
          //Any errors here
          .catch(err => interaction.editReply(`Some error ocurred. Here's a debug: ${err}`))
      }).then(() => {
        fs.promises.unlink(pathTS).catch(() => { });
        fs.promises.unlink(pathPNG).catch(() => { });
      });
      setTimeout(() => {
        if (!stl.killed) stl.kill();
      }, 3500);
    } catch (err) {
      //Errors
      if (interaction.replied || interaction.deferred) interaction.editReply(err.toString());
      else interaction.reply(err.toString());
    }
  }
}
