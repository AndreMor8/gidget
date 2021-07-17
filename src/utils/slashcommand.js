/* eslint-disable no-unused-vars */
import Discord from 'discord.js';

export default class SlashCommand {
    constructor(opciones) {
        if (typeof opciones.name !== "string") throw new Error("opciones.name must be a string");

        //For create the command
        this.deployOptions = {};

        //Default required command options
        this.name = this.deployOptions.name = opciones.name;
        this.deployOptions.description = "*Without description*";

        //Options for bot to check on-the-fly
        //Server-only commands
        this.guildonly = false;
        //Requires bot instance to be in server (defaults to false on-the-fly on DMs).
        this.requireBotInstance = true;
        //Add this command to Wow Wow Discord
        this.onlyguild = false;
        //Who can use this command?
        this.permissions = {
            user: [0n, 0n],
            bot: [0n, 0n]
        }
    }
    /**
     * Runs the command
     * @param {Discord.Client} bot
     * @param {Discord.CommandInteraction} interaction
     * @return {Promise<any>}
     * @abstract
     */
    async run(bot, interaction) { // eslint-disable-line require-await
        throw new Error(`${this.constructor.name} doesn't have a run() method.`);
    }
}