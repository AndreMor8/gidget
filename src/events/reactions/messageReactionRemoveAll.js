module.exports = async (bot, message) => {
  if (message.channel.type === 'dm') return;
    const channel = message.guild.channels.cache.find(
        channel => channel.name === "full_logs"
    );
    if (!channel) return;
    channel.send(
        `Reactions were removed in this message:\n${message.url}`
    );
};