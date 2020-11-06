import BOATS from 'boats.js';
const Boats = new BOATS(process.env.DISCORDBOATS, "v2");
export default async function(bot) {
    const posted = await Boats.postStats(bot.guilds.cache.size, bot.user.id);
    console.log("discord.boats: Server count posted!");
    return posted;
}