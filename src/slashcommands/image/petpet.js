import Canvas from 'canvas';
import petpet from '../../utils/petpet.js';
const fpsnumber = 16;
const delay = parseInt(1000 / fpsnumber);
export default class extends SlashCommand {
    constructor(options) {
        super(options);
        this.deployOptions.name = "petpet";
        this.deployOptions.description = undefined;
        this.deployOptions.type = 2;
        this.permissions = {
            user: [0n, 0n],
            bot: [0n, 32768n]
        }
    }
    async run(bot, raw, interaction) {
        let source = await bot.users.fetch(raw.data.target_id).catch(() => { });
        if (!source) return interaction.reply("Invalid user!");
        source = source.displayAvatarURL({ format: "png", size: 128 });
        await interaction.defer();
        const torender = await Canvas.loadImage(source);
        const buf = await petpet(torender, delay);
        await interaction.editReply({
            files: [{
                attachment: buf,
                name: "petpet.gif",
            }]
        });
    }
}
