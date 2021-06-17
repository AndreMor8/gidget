import BOATS from 'boats.js';
export default async function (sharder) {
    console.log(await sharder.fetchClientValues('readyAt').then((a) => a.every((b) => b)));
    const Boats = new BOATS(process.env.DISCORDBOATS, "v2");
    const posted = await Boats.postStats((await sharder.broadcastEval(c => c.guilds.cache)).map(e => e.length).reduce((acc, guildCount) => acc + guildCount, 0), "694306281736896573");
    console.log("discord.boats: Server count posted!");
    return posted;
}