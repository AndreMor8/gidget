---
description: Internal bot code and its operation.
---

# How is it done?

{% hint style="info" %}
Both the bot and the dashboard are open source, you can use the links on the left to fully explore the code and its functions.
{% endhint %}

{% hint style="warning" %}
An explanation of the code used by commands may come with the documentation for the command.
{% endhint %}

## Discord Bot

Gidget is made in JavaScript with Node.js, with the Discord.js library.

The current syntax uses:

* ES6 modules.
* Some new methods of it.
* Global variables to hold 1 single instance of something, like the Command class or the command list.
* ESLint for better way of writing code
* Cache system to avoid unnecessary re-queries to the database
* .env file (yes also supports environment variables but I use .env)
* Best attempt to avoid bot abuse and catch bugs easily.
* Command and event handler
* Extended classes for commands

AndreMor always checks for Node.js updates or project dependencies to see if he can add new features to the bot.

MongoDB database is used, hosted in MongoDB Atlas, to always keep the data wherever this bot goes.

The bot also uses some packages that need additional installation on the operating system. These are `node-lame`, `qr` and `puppeteer`

## Dashboard

The dashboard is made in JavaScript with Node.js, using Express, EJS and passport (with passport-discord)

Unlike the bot, it still uses CommonJS as syntax to import and export modules.

For the front-end, Bulma is used as the CSS framework, and Vanilla JavaScript for scripting (native JavaScript DOM in few words).

Also uses MongoDB.
