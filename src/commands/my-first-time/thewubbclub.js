//Note that if you dont like this command you can delete it safely because i made this when i was new to discordjs and it is not neccesary to the bot
module.exports = {
    run: async (bot, message, args) => {
      message.channel.send('In The Wubb Club is all the related fanmade of the Wow! Wow! Wubbzy! series. If you have ypur own fanmade of this series, you can add it here without problems! Here is the link: https://wubbzyfanon.fandom.com/ ')
    },
    aliases: ["twc", "wubbzyfanon"],
    onlyguild: true,
    description: "Link to the Wubb Club Wiki",
    permissions: {
      user: [0, 0],
      bot: [0, 0]
    }
}
