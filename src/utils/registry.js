import fs from 'fs';
import path from 'path';
import Command from './command.js';
import commons from './commons.js';
const { __dirname } = commons(import.meta.url);
export async function registerCommands(bot, dir) {
    const arr = dir.split("/");
    const category = arr[arr.length - 1];
    let files = fs.readdirSync(path.join(__dirname, dir));
    // Loop through each file.
    for (let file of files) {
        let stat = fs.lstatSync(path.join(__dirname, dir, file));
        if (stat.isDirectory()) // If file is a directory, recursive call recurDir
            registerCommands(bot, path.join(dir, file));
        else {
            // Check if file is a .js file.
            if (file.endsWith(".js")) {
                let cmdName = file.substring(0, file.indexOf(".js"));
                try {
                    let cmdModule = await import(path.join(__dirname, dir, file));
                    let cmdClass = new cmdModule.default({ name: cmdName, category, bot })
                    bot.commands.set(cmdName, cmdClass);

                }
                catch (err) {
                    console.error("There was an error initializing the " + cmdName + " command\n", err);
                    class ErrorCommand extends Command {
                        constructor(options) {
                            super(options);
                            this.description = "That command is not loaded due to error";
                            this.secret = true;
                        }
                        async run(message, args) {
                            await message.channel.send("That command is not loaded due to error: " + err);
                        }
                    }
                    bot.commands.set(cmdName, new ErrorCommand({ name: cmdName, category, bot }));
                }
            }
        }
    }
}
export async function registerEvents(bot, dir) {
    let files = fs.readdirSync(path.join(__dirname, dir));
    // Loop through each file.
    for (let file of files) {
        let stat = fs.lstatSync(path.join(__dirname, dir, file));
        if (stat.isDirectory()) // If file is a directory, recursive call recurDir
            registerEvents(bot, path.join(dir, file));
        else {
            // Check if file is a .js file.
            if (file.endsWith(".js")) {
                let eventName = file.substring(0, file.indexOf(".js"));
                try {
                    let eventModule = await import(path.join(__dirname, dir, file));
                    bot.on(eventName, eventModule.default.bind(null, bot));
                }
                catch (err) {
                    console.error("There was an error initializing the " + eventName + " event\n", err);
                }
            }
        }
    }
}