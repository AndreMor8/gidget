/* eslint-disable no-unused-vars */
import Discord from 'discord.js';
export default class Command {
    constructor(opciones) {
        if(typeof opciones.name !== "string") throw new Error("opciones.name must be a string");
        if(typeof opciones.category !== "string") throw new Error("opciones.category must be a string");
        this.name = opciones.name;
        this.category = opciones.category;
        this.aliases = [];
        this.description = "*Without description*";
        this.permissions = {
            user: [0n, 0n],
            bot: [0n, 0n]
        }
        this.owner = false;
        this.guildonly = false;
        this.onlyguild = false;
        this.dev = false;
        this.secret = false;
    }
    /**
	 * Runs the command
     * @param {Discord.Client} bot
	 * @param {Discord.Message} message
	 * @param {string[]} args
	 * @return {Promise<void>}
	 * @abstract
	 */
    async run(bot, message, args) { // eslint-disable-line require-await
		throw new Error(`${this.constructor.name} doesn't have a run() method.`);
	}
    delete() {
        this.client.commands.delete(this.name);
    }
}