import dotenv from 'dotenv';
dotenv.config();
import webserver from './webserver.js';
//import discordboats from './utils/discordboats.js';
import Discord from 'discord.js-light';
const execArgv = ["--experimental-json-modules", "--expose-gc", "--optimize_for_size"];
if(process.env.OLDMEMORY) execArgv.push("--max_old_space_size=" + process.env.OLDMEMORY);
const manager = new Discord.ShardingManager('./src/bot.js', {
    token: process.env.DISCORD_TOKEN,
    totalShards: parseInt(process.env.SHARDS_WANTED) || "auto",
    execArgv
});
manager.on('shardCreate', shard => {
    console.log(`Launched shard ${shard.id}`);
    
});
manager.spawn({ timeout: Infinity }).then(() => {
    /*if (process.env.EXTERNAL === "yes") {
        discordboats(manager);
        setInterval(discordboats, 1800000, manager);
    }*/
    webserver(manager);
});
