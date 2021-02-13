/* eslint-disable no-unused-vars */
export default class Command {
    constructor(opciones) {
        if(typeof opciones.name !== "string") throw new Error("opciones.name must be a string");
        if(typeof opciones.category !== "string") throw new Error("opciones.category must be a string");
        this.name = opciones.name;
        this.category = opciones.category;
        this.aliases = [];
        this.description = "*Without description*";
        this.permissions = {
            user: [0, 0],
            bot: [0, 0]
        }
        this.owner = false;
        this.guildonly = false;
        this.onlyguild = false;
        this.dev = false;
        this.secret = false;
    }
    async run(bot, message, args) {
        console.log(`${this.name} command was executed`);
        await message.channel.send(`${this.name} command was executed`);
    }
    delete() {
        this.client.commands.delete(this.name);
    }
}