import { isMaster } from 'cluster';
import dotenv from 'dotenv';
dotenv.config();
import commons from './utils/commons.js';
const { __dirname } = commons(import.meta.url);
import 'discord.js';
import './structures.js';
import { ShardingManager } from 'kurasuta';
import path from 'path';
import webserver from './webserver.js';
import discordboats from './utils/discordboats.js';
const sharder = new ShardingManager(path.join(__dirname, 'kurasuta-bot.js'), {
    token: process.env.DISCORD_TOKEN,
    clientOptions: { partials: ["MESSAGE", "REACTION", "CHANNEL", "GUILD_MEMBER", "USER"], ws: { properties: { $browser: "Discord Android" }, intents: 32511 }, allowedMentions: { parse: [] }, presence: { status: "dnd", activity: { name: "Ready event (Loading...)", type: "LISTENING" } } }
});
sharder.on('ready', c => console.log(`Launched cluster ${c.id}`));
sharder.on('shardReady', shard => console.log(`Launched shard ${shard}`));
sharder.spawn().then(() => {
    if (isMaster) {
        if (process.env.EXTERNAL === "yes") {
            discordboats(sharder);
            setInterval(discordboats, 1800000, sharder);
        }
        webserver(sharder);
    }
});
process.on("unhandledRejection", error => {
    console.error("Unhandled promise rejection:", error);
});

process.on("uncaughtException", err => {
    console.error("Uncaught exception:", err);
    process.exit(1);
});