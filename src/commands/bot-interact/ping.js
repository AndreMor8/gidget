import mongoose from 'mongoose';
import ping from 'ping';

export default class extends Command {
    constructor(options) {
        super(options);
        this.description = "Bot test";
    }
    async run(bot, message) {
        const msg = await message.channel.send("Pong!");
        const pings = [`📨 Message ping: ${Date.now() - msg.createdTimestamp}ms`, `📡 Ping from the API: ${(await bot.shard.broadcastEval(c => c.ws.ping)).reduce((a, c, i, arr) => i === (arr.length - 1) ? (a + c) / arr.length : a + c, 0)}ms`, `📦 Shard ${bot.shard?.ids[0] || 0} ping: ${bot.ws.ping || "?"}ms`];
        const pageping = await ping.promise.probe("gidget.xyz");
        pings.push(`🌎 gidget.xyz ping: ${pageping.time}ms`);
        const dbping = await new Promise((s, r) => {
            try {
                const dates = Date.now();
                mongoose.connection.db.admin().ping(function (err, result) {
                    if (err || !result) return r(err || new Error("No ping for the DB"));
                    s(Date.now() - dates);
                });
            } catch (error) {
                r(error);
            }
        });
        pings.push(`🗃️ DB ping: ${dbping}ms`);
        await msg.edit(pings.join("\n\n"));
    }
}