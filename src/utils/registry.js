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
export async function registerCommands(bot, dir) {
    if (!bot.commands) bot.commands = new Collection();
    if (!global.Command) global.Command = (await import("file:///" + path.join(__dirname, "command.js"))).default;
    const arr = dir.split(process.platform === "win32" ? "\\" : "/");
    const category = arr[arr.length - 1];
    const files = await fs.readdir(path.join(__dirname, dir));
    // Loop through each file.
    for (const file of files) {
        const stat = await fs.lstat(path.join(__dirname, dir, file));
        if (stat.isDirectory()) // If file is a directory, recursive call recurDir
            await registerCommands(bot, path.join(dir, file));
        else {
            // Check if file is a .js file.
            if (file.endsWith(".js")) {
                const cmdName = file.substring(0, file.indexOf(".js"));
                try {
                    const cmdModule = await import("file:///" + path.join(__dirname, dir, file));
                    const cmdClass = new cmdModule.default({ name: cmdName, category })
                    bot.commands.set(cmdName, cmdClass);
                    if (process.argv[2] === "ci") console.log(`Command ${cmdName} loaded =D`);
                }
                catch (err) {
                    process.exitCode = 1;
                    console.error("There was an error initializing the " + cmdName + " command\n", err);
                    bot.commands.set(cmdName, new ErrorCommand({ name: cmdName, category, err }));
                }
            }
        }
    }
    global.Command = null;
    delete global.Command;
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

export async function registerWsEvents(bot, dir) {
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
                    bot.ws.on(eventName, eventModule.default.bind(null, bot));
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