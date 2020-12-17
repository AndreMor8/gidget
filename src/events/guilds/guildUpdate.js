export default (bot, guild) => {
    //No API Abuse
    const [hour] = new Date().toLocaleTimeString("en-US", { timeZone: "America/New_York", hour12: false }).split(/:| /);
    const check = bot.doneBanners.get(guild.id);
    if(check && check !== hour) bot.doneBanners.delete(guild.id);
}