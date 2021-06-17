import model from '../database/models/banner.js';
export default (bot) => {
    return setInterval(async () => {
        const [hour] = new Date().toLocaleTimeString("en-US", { timeZone: "America/New_York", hour12: false }).split(/:| /);
        const pre_docs = await model.find({ enabled: true });
        const docs = pre_docs.filter(e => bot.guilds.cache.has(e.guildID));
        if(docs && docs[0]) {
            for(const doc of docs) {
                const banner = doc.banners.find(e => e.hour == hour);
                if(banner && (bot.doneBanners.get(doc.guildID) != hour)) {
                    const g = bot.guilds.cache.get(doc.guildID);
                    if(g?.me.permissions.has("MANAGE_GUILD") && (g?.features.includes("BANNER"))) await g.setBanner(banner.url).catch(() => {});
                    bot.doneBanners.set(doc.guildID, hour);
                }
            }
        }
    }, 60000);
};