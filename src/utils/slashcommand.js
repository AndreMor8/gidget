/* eslint-disable no-unused-vars */
import Discord from 'discord.js';
export default class SlashCommand {
    constructor(opciones) {
        if(typeof opciones.name !== "string") throw new Error("opciones.name must be a string");
        this.name = opciones.name;
        this.description = "*Without description*";
        this.guildonly = false;
        this.onlyguild = false;
        this.permissions = {
            user: [0n, 0n],
            bot: [0n, 0n]
        }
        //include any other options :jiggler:
    }
    /**
	 * Runs the command
     * @param {Discord.Client} bot
	 * @param {Discord.Message} interaction
	 * @return {Promise<void>}
	 * @abstract
	 */
    async run(bot, interaction) { // eslint-disable-line require-await
		throw new Error(`${this.constructor.name} doesn't have a run() method.`);
	}
}