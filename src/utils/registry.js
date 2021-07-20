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
    async run(bot, message) {
        await message.channel.send("That command is not loaded due to error: " + this.error);
    }
}
class SlashCommandOnlyCommand extends Command {
    constructor(options) {
        super(options);
        this.description = `**(Slash command)** ${options.description}`;
    }
    async run(bot, message) {
        if (message.deletable) await message.delete();
        await message.channel.send("This is a slash command, please use it in the Discord interface.");
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
        if (stat.isDirectory())
            await registerCommands(bot, path.join(dir, file));
        else {
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
        if (stat.isDirectory())
            await registerEvents(bot, path.join(dir, file));
        else {
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

//RECOMMENDED TO EXECUTE THIS AFTER registerCommands FUNCTION.
export async function registerSlashCommands(bot, dir) {
    if (!bot.slashCommands) bot.slashCommands = new Collection();
    if (!global.SlashCommand) global.SlashCommand = (await import("file:///" + path.join(__dirname, "slashcommand.js"))).default;
    const arr = dir.split(process.platform === "win32" ? "\\" : "/");
    const category = arr[arr.length - 1];
    const files = await fs.readdir(path.join(__dirname, dir));
    // Loop through each file.
    for (const file of files) {
        const stat = await fs.lstat(path.join(__dirname, dir, file));
        if (stat.isDirectory())
            await registerSlashCommands(bot, path.join(dir, file));
        else {
            if (file.endsWith(".js")) {
                const name = file.substring(0, file.indexOf(".js"));
                try {
                    const cmdModule = await import("file:///" + path.join(__dirname, dir, file));
                    const cmdClass = new cmdModule.default({ name });
                    bot.slashCommands.set(name, cmdClass);

                    if (process.argv[2] === "ci") console.log(`Command ${name} loaded =D`);
                    else if (bot.commands && !bot.commands.get(name) && !cmdClass.onlyguild) {
                        const cc = new SlashCommandOnlyCommand({ name, description: cmdClass.deployOptions.description, category });
                        bot.commands.set(name, cc);
                    }
                }
                catch (err) {
                    process.exitCode = 1;
                    console.error("There was an error initializing the " + name + " command\n", err);
                }
            }
        }
    }
    global.SlashCommand = null;
    delete global.SlashCommand;
}