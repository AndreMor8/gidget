import { Collection } from 'discord.js';
import { promises as fs } from 'fs';
import path from 'path';
import Command from './command.js';
import commons from './commons.js';
const { __dirname } = commons(import.meta.url);
class ErrorCommand extends Command {
    constructor(options) {
        super(options);
        this.description = "That command is not loaded due to error";
        this.secret = true;
        this.error = options.err;
    }

    // eslint-disable-next-line no-unused-vars
    async run(bot, message, args) {
        await message.channel.send("That command is not loaded due to error: " + this.error);
    }
}
export async function registerCommands(dir) {
    if (!global.botCommands) global.botCommands = new Collection();
    if (!global.Command) global.Command = (await import("file:///" + path.join(__dirname, "command.js"))).default;
    const arr = dir.split("/");
    const category = arr[arr.length - 1];
    const files = await fs.readdir(path.join(__dirname, dir));
    // Loop through each file.
    for (const file of files) {
        const stat = await fs.lstat(path.join(__dirname, dir, file));
        if (stat.isDirectory()) // If file is a directory, recursive call recurDir
            await registerCommands(path.join(dir, file));
        else {
            // Check if file is a .js file.
            if (file.endsWith(".js")) {
                const cmdName = file.substring(0, file.indexOf(".js"));
                try {
                    const cmdModule = await import("file:///" + path.join(__dirname, dir, file));
                    const cmdClass = new cmdModule.default({ name: cmdName, category })
                    global.botCommands.set(cmdName, cmdClass);
                    if (process.argv[2] === "ci") console.log(`Command ${cmdName} loaded =D`);
                }
                catch (err) {
                    process.exitCode = 1;
                    console.error("There was an error initializing the " + cmdName + " command\n", err);
                    global.botCommands.set(cmdName, new ErrorCommand({ name: cmdName, category, err }));
                }
            }
        }
    }
}
export async function registerEvents(bot, dir) {
    const files = await fs.readdir(path.join(__dirname, dir));
    // Loop through each file.
    for (const file of files) {
        const stat = await fs.lstat(path.join(__dirname, dir, file));
        if (stat.isDirectory()) // If file is a directory, recursive call recurDir
            await registerEvents(bot, path.join(dir, file));
        else {
            // Check if file is a .js file.
            if (file.endsWith(".js")) {
                const eventName = file.substring(0, file.indexOf(".js"));
                try {
                    const eventModule = await import("file:///" + path.join(__dirname, dir, file));
                    bot.on(eventName, eventModule.default.bind(null, bot));
                    if (process.argv[2] === "ci") console.log(`Event ${eventName} loaded =D`);
                }
                catch (err) {
                    process.exitCode = 1;
                    console.error("There was an error initializing the " + eventName + " event\n", err);
                }
            }
        }
    }
}