import Discord from 'discord.js';

export default class Command {
    constructor(opciones) {
        if(typeof opciones.name !== "string") throw new Error("opciones.name must be a string");
        if(typeof opciones.category !== "string") throw new Error("opciones.category must be a string");
        if(!(opciones.bot instanceof Discord.Client)) throw new Error("opciones.client must be an instance of <discord.js>.Client");
        this.name = opciones.name;
        this.category = opciones.category;
        this.bot = opciones.bot;
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
    async run(message, args) {
        console.log(`Èl comando ${this.name} se ha ejecutado, ar`);
        message.channel.send(`Èl comando ${this.name} se ha ejecutado`);
    }
    delete() {
        this.client.commands.delete(this.name);
    }
}