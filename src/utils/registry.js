const fs = require('fs');
const path = require('path');
const { checkCommandModule, checkProperties } = require('./validate');

module.exports = {
    registerCommands: function (bot, dir) {
        const arr = dir.split("/");
        const category = arr[arr.length - 1];
        let files = fs.readdirSync(path.join(__dirname, dir));
        // Loop through each file.
        for (let file of files) {
            let stat = fs.lstatSync(path.join(__dirname, dir, file));
            if (stat.isDirectory()) // If file is a directory, recursive call recurDir
                this.registerCommands(bot, path.join(dir, file));
            else {
                // Check if file is a .js file.
                if (file.endsWith(".js")) {
                    let cmdName = file.substring(0, file.indexOf(".js"));
                    try {
                        let cmdModule = require(path.join(__dirname, dir, file));
                        if (checkCommandModule(cmdName, cmdModule) && checkProperties(cmdName, cmdModule)) {
                            Object.defineProperties(cmdModule, {
                                'name': {
                                    value: cmdName,
                                    enumerable: true
                                },
                                'category': {
                                    value: category,
                                    enumerable: true
                                },
                            });
                            bot.commands.set(cmdName, cmdModule);
                        }
                    }
                    catch (err) {
                        console.error("There was an error initializing the " + cmdName + " command\n", err);
                        bot.commands.set(cmdName, { run: async (bot, message, args) => message.channel.send("That command is not loaded due to error: " + err), description: "That command is not loaded due to error", aliases: [] });
                    }
                }
            }
        }
    },
    registerEvents: function (bot, dir) {
        let files = fs.readdirSync(path.join(__dirname, dir));
        // Loop through each file.
        for (let file of files) {
            let stat = fs.lstatSync(path.join(__dirname, dir, file));
            if (stat.isDirectory()) // If file is a directory, recursive call recurDir
                this.registerEvents(bot, path.join(dir, file));
            else {
                // Check if file is a .js file.
                if (file.endsWith(".js")) {
                    let eventName = file.substring(0, file.indexOf(".js"));
                    try {
                        let eventModule = require(path.join(__dirname, dir, file));
                        bot.on(eventName, eventModule.bind(null, bot));
                    }
                    catch (err) {
                        console.error("There was an error initializing the " + eventName + " event\n", err);
                    }
                }
            }
        }
    }
};