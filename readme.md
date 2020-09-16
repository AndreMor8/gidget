# Super Solar-Powered Robot 3000 a.k.a Gidget

Gidget here is a customized Discord bot, the name comes from the [_Wow! Wow! Wubbzy!_](https://wubbzy.fandom.com/wiki/Wubbzy) show with the robot of the same name.

It was created in the hope that it would be useful, since AndreMor really wanted _Wow Wow Discord_ to have its own bot.

The real bot on Discord is *Gidget#2936* with ID *694306281736896573*.

In this folder the source code of Gidget is offered either to learn how it works or to add the commands to other bot instances.

You are also welcome to invite the bot here: https://discordapp.com/api/oauth2/authorize?client_id=694306281736896573&permissions=0&scope=bot

Join the support server: https://discord.gg/KDy4gJ7

Note that self-hosting is not dynamic, you will need to change some parts of the code for Gidget to suit you.
_I know, I haven't put an example of the .env file yet, you will have to search the code for the necessary variables. :(_

## Some details

This bot uses Discord.js v12.3.1 to interact with the Discord API.

The command/event handler base and reaction-role system are based on [**this code**](https://github.com/ansonfoong/discordjs-v12-bot).

This bot has a database, the type is MongoDB and Mongoose is used to access it. The database is hosted in MongoDB Atlas.
If you are going to self-host you will need at least one MongoDB database.

`admins.js` and `mods.js`, as well as the Admin list in `serverinfo.js` are exclusive to Wow Wow Discord in this bot.

The `my-first-time` folder contains basic commands from what was my first time in JavaScript. They were passed from NuggetBot (CC feature) to this bot, and they are only used by the Wow Wow Discord server.

Some commands in this bot have *Wow! Wow! Wubbzy!* as topic or refer to it.

This bot is compatible with DM channels. Although not all commands will obviously work.

You can freely contribute to the bot by [GitHub](https://github.com/AndreMor955/gidget/) either by issues or by pull requests, if the changes are approved then you will see them in the real bot. Thanks for contributing.
