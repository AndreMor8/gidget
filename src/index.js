import 'dotenv/config.js';
import Discord from 'discord.js';
import webserver from './webserver.js';

const execArgv = ["--expose-gc", "--optimize_for_size"];
if (process.env.OLDMEMORY) execArgv.push("--max_old_space_size=" + process.env.OLDMEMORY);

const manager = new Discord.ShardingManager('./src/bot.js', {
	token: process.env.DISCORD_TOKEN,
	totalShards: parseInt(process.env.SHARDS_WANTED) || "auto",
	execArgv
});

manager.on('shardCreate', shard => {
	console.log(`Launched shard ${shard.id}`);
});

await manager.spawn({ timeout: Infinity })

webserver(manager);