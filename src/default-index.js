import dotenv from 'dotenv';
dotenv.config();
import webserver from './webserver.js';
import discordboats from './utils/discordboats.js';
import { ShardingManager } from 'discord.js';
const execArgv = ["--experimental-json-modules", "--expose-gc"];
if(process.env.OLDMEMORY) execArgv.push("--optimize_for_size", ("--max_old_space_size=" + process.env.OLDMEMORY));
const manager = new ShardingManager('./src/default-bot.js', {
    token: process.env.DISCORD_TOKEN,
    totalShards: 2,
    execArgv
});
manager.on('shardCreate', shard => console.log(`Launched shard ${shard.id}`));
manager.spawn().then(() => {
    if (process.env.EXTERNAL === "yes") {
        discordboats(manager);
        setInterval(discordboats, 1800000, manager);
    }
    webserver(manager);
});