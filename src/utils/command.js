/* eslint-disable no-unused-vars */
import Discord from 'discord.js';
export default class Command {
    constructor(opciones) {
        if (typeof opciones.name !== "string") throw new Error("opciones.name must be a string");
        if (typeof opciones.category !== "string") throw new Error("opciones.category must be a string");

        //Deduced from filename.
        this.name = opciones.name;
        //Deduced from the folder the file belongs to.
        this.category = opciones.category;
        //Always include an array
        this.aliases = [];
        //Always include an empty string
        this.description = "";
        //Who can use this command?
        this.permissions = {
            user: [0n, 0n],
            bot: [0n, 0n]
        }
        //For exclusive use of the bot creator (AndreMor)
        this.owner = false;
        //Server-only commands
        this.guildonly = false;
        //Use this command only on Wow Wow Discord
        this.onlyguild = false;
        //For exclusive use of developers
        this.dev = false;
        //This command must not appear on the dynamic help text.
        this.secret = false;
    }
    /**
     * Runs the command
     * @param {Discord.Client} bot
     * @param {Discord.Message} message
     * @param {string[]} args
     * @return {Promise<any>}
     * @abstract
     */
    async run(bot, message, args) { // eslint-disable-line require-await
        throw new Error(`${this.constructor.name} doesn't have a run() method.`);
    }
}