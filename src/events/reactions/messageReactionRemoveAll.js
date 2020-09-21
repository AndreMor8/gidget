export default async (bot, message) => {
    if (!message.guild) return;
    const channel = message.guild.channels.cache.get("656991277291667506")
    if (!channel) return;
    channel.send(`Reactions were removed in this message:\n${message.url}`);
};