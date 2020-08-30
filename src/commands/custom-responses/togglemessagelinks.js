module.exports = {
    aliases: [],
    permissions: {
        user: [8, 0],
        bot: [0, 0]
    },
    description: "This command enables message link detection so that a message from the bot appears with its content.",
    run: async (bot, message, args) => {
        const thing = message.guild.cache.messagelinksconfig ? message.guild.messagelinksconfig : await message.guild.getMessageLinksConfig();
        await message.guild.setMessageLinksConfig(!thing.enabled);
        message.channel.send("You have " + (!thing.enabled ? "enabled" : "disabled") + " the message link detection system");
    }
}