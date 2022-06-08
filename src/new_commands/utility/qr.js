import qrenc from 'qr';
import Canvas from 'canvas';
import { MessageAttachment, Util } from "discord.js";
import jsQR from 'jsqr';
import isSvg from 'is-svg';
import svg2img_callback from 'node-svg2img';
import { promisify } from 'util';
const SIZE = 768;
const svg2img = promisify(svg2img_callback);

export default class extends SlashCommand {
  constructor(options) {
    super(options)
    this.deployOptions.description = "Generate a QR";
    this.deployOptions.options = [{
      name: "decode",
      description: "Decode the QR code of some image",
      type: "SUB_COMMAND",
      options: [{
        name: "url",
        description: "The link to that image",
        type: "STRING",
        required: true
      }]
    },
    {
      name: "encode",
      description: "Create a QR from plain text",
      type: "SUB_COMMAND",
      options: [{
        name: "text",
        description: "Text to convert to QR",
        type: "STRING",
        required: true
      },
      {
        name: "dot-size",
        description: "This defines the size of the generated QR",
        type: "INTEGER",
        required: false,
        minValue: 1,
        maxValue: 12
      }]
    }]
    this.permissions = {
      user: [0n, 0n],
      bot: [0n, 32768n]
    };
  }
  async run(bot, interaction) {
    switch (interaction.options.getSubcommand()) {
      case 'decode': {
        try {
          const source = new URL(interaction.options.getString("url"));
          await interaction.deferReply({ ephemeral: true });
          const buf = await resize(source.href);
          const image = await Canvas.loadImage(buf);
          const canvas = Canvas.createCanvas(SIZE, SIZE);
          const ctx = canvas.getContext("2d");
          ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
          const code = jsQR(ctx.getImageData(0, 0, canvas.width, canvas.height).data, canvas.width, canvas.height);
          if (code) {
            if (!code.data) return await interaction.editReply("I couldn't read any QR code. Try again");
            const newstr = Util.splitMessage(code.data, { limit: 2000, char: "" });
            await interaction.editReply({ content: "`Output:` " + newstr[0], ephemeral: true });
          } else {
            await interaction.editReply({ content: "I couldn't read any QR code. Try again", ephemeral: true });
          }
        } catch (err) {
          if (interaction.replied) interaction.editReply({ content: err.toString(), ephemeral: true });
          else interaction.reply({ content: err.toString(), ephemeral: true });
        }
      }
        break;
      case 'encode':
      default: {
        const encoder = new qrenc.Encoder;
        encoder.on("end", (buf) => interaction.editReply({ files: [new MessageAttachment(buf, "qr.png")], ephemeral: true }));
        encoder.on("error", (err) => interaction.editReply({ content: `Error when encoding QR: ${err}`, ephemeral: true }));
        await interaction.deferReply({ ephemeral: true });
        encoder.encode(interaction.options.getString("text"), null, { dot_size: interaction.options.getInteger("dot-size", false) || 6, margin: 1 });
      }
    }
  }
}

async function resize(url) {
  // eslint-disable-next-line no-undef
  const res = await fetch(url);
  if (!res.ok) throw new Error("Status code: " + res.status);
  const buf = Buffer.from(await res.arrayBuffer());
  if (isSvg(buf)) {
    return await svg2img(buf, { format: "png", width: SIZE, height: SIZE });
  } else if (process.platform === "win32") {
    //npm i jimp
    //https://sharp.pixelplumbing.com/install#canvas-and-windows
    // eslint-disable-next-line import/no-unresolved
    const Jimp = (await import("jimp")).default;
    const pre_buf = await Jimp.read(buf);
    pre_buf.resize(SIZE, SIZE);
    const newbuf = await pre_buf.getBufferAsync(Jimp.MIME_PNG);
    return newbuf;
  } else {
    const sharp = (await import("sharp")).default;
    const newbuf = await sharp(buf).resize(SIZE, SIZE).png().toBuffer();
    return newbuf;
  }
}