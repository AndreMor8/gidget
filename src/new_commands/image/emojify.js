import { AttachmentBuilder, ButtonBuilder, ActionRowBuilder, ModalBuilder, TextInputBuilder } from 'discord.js';
import { fileTypeFromBuffer } from 'file-type';
import gifResize from '../../utils/gifresize.js';
import mediaExtractor from 'media-extractor';
import isSvg from 'is-svg';
import svg2img_callback from 'node-svg2img';
import { promisify } from 'util';
import parser from 'twemoji-parser';
import { isURL } from '../../extensions.js';
const svg2img = promisify(svg2img_callback);

export default class extends SlashCommand {
    constructor(options) {
        super(options);
        this.deployOptions.description = "Make a fake emoji and save it in your favorite GIFs.";
        this.deployOptions.options = [{
            name: "image",
            description: "Image to emojify",
            type: 3,
            required: true
        },
        {
            name: "force-png",
            description: "With this you will make your image not move",
            type: 5,
            required: false
        }]
        this.permissions = {
            user: [0n, 0n],
            bot: [0n, 32768n]
        }
    }
    async run(bot, interaction) {
        const input = interaction.options.getString("image");
        const force = interaction.options.getBoolean("force-png") || false;
        let url;
        if (isURL(input)) {
            if ((/tenor\.com\/view/.test(input) || /tenor.com\/.+\.gif/.test(input) || /giphy\.com\/gifs/.test(input))) url = await mediaExtractor.resolve(input).catch(() => { });
            else url = input;
        }
        if (input.match(/<?(a:|:)\w*:(\d{17,20})>/)) {
            const matched = input.match(/<?(a:|:)\w*:(\d{17,20})>/);
            const ext = input.startsWith("<a:") ? ("gif") : ("png");
            url = `https://cdn.discordapp.com/emojis/${matched[2]}.${ext}`;
        }

        const parsed = parser.parse(input);
        if (parsed.length >= 1) url = parsed[0].url;

        if (!url) return interaction.reply({ content: "Invalid URL!", ephemeral: true });
        const { pre_type, buffer } = await render(url);

        const but_add = new ButtonBuilder()
            .setStyle("Primary")
            .setCustomId("emojify_c_add2sv_i")
            .setLabel("Add to server")
            .setDisabled(!(interaction.guild?.members.me.permissions.has("ManageEmojisAndStickers") && interaction.member?.permissions.has("ManageEmojisAndStickers")));

        const att = new AttachmentBuilder(buffer, { name: `emoji.${force ? "png" : "gif"}` });
        const here = await interaction.reply({ files: [att], components: [new ActionRowBuilder().addComponents([but_add])], fetchReply: true });

        if (!but_add.disabled) {
            const butcol = here.createMessageComponentCollector({ filter: (button) => button.user.id === interaction.user.id, idle: 60000 });
            let sended = false;
            butcol.on("collect", async (button) => {
                if (!(interaction.guild?.members.me.permissions.has("ManageEmojisAndStickers") && interaction.member?.permissions.has("ManageEmojisAndStickers"))) return await button.reply("Nope");
                const modal = new ModalBuilder()
                    .setCustomId("emojify_c_add2sv_m")
                    .setTitle("Emojify")
                    .addComponents(new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("emojify_c_add2sv_name").setRequired(true).setLabel("Name for this new emoji").setStyle("Short")));
                await button.showModal(modal);
                if (sended) return;
                sended = true;
                const res = await button.awaitModalSubmit({ filter: (i) => i.customId === modal.data.custom_id && i.user.id === interaction.user.id, time: 30000 }).catch(() => { });
                if (res) {
                    const final = res.fields.getTextInputValue("emojify_c_add2sv_name");
                    await res.update({ components: [new ActionRowBuilder().addComponents([but_add.setDisabled(true)])] }).catch(() => { });
                    res.guild.emojis.create({ attachment: (pre_type == "svg") ? buffer : url, name: final, reason: "emojify command" }).then(async (e) => {
                        await res.followUp(`Emoji created correctly! -> ${e.toString()}`).catch(() => { });
                    }).catch(async e => await res.followUp("Error: " + e).catch(() => { }))
                        .finally(() => butcol.stop());
                } else {
                    sended = false;
                    return button.followUp({ content: "The maximum response waiting time is 30s. Run the modal again...", ephemeral: true });
                }


            });
            butcol.on("ignore", (button) => button.reply({ content: "You are not authorized", ephemeral: true }));
            butcol.on("end", (c, r) => { if (r === "idle") here.edit({ components: [new ActionRowBuilder().addComponents([but_add.setDisabled(true)])] }).catch(() => { }) });
        }
    }
}

async function render(url) {
    // eslint-disable-next-line no-undef
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Status code returned ${res.status}`);
    const pre_buf = Buffer.from(await res.arrayBuffer());
    const type = await fileTypeFromBuffer(pre_buf);
    if (type?.mime === "image/gif") {
        const buffer = await gifResize({ width: 48, interlaced: true })(pre_buf);
        return { pre_type: "gif", buffer };
    } else if (isSvg(pre_buf)) {
        return { pre_type: "svg", buffer: await svg2img(pre_buf, { extension: "png", width: 48, height: 48 }) };
    } else if (process.platform === "win32") {
        //npm i jimp
        //https://sharp.pixelplumbing.com/install#canvas-and-windows
        // eslint-disable-next-line import/no-unresolved
        const Jimp = (await import("jimp")).default;
        const img = await Jimp.read(pre_buf);
        img.resize(48);
        const buffer = await img.getBufferAsync(Jimp.MIME_PNG);
        return { pre_type: "image", buffer };
    } else {
        const sharp = (await import("sharp")).default;
        const buffer = await sharp(pre_buf).resize(48).png().toBuffer();
        return { pre_type: "image", buffer };
    }
}
