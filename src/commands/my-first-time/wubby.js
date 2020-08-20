//Note that if you dont like this command you can delete it safely because i made this when i was new to discordjs and it is not neccesary to the bot
module.exports = {
    run: async (bot, message, args) => {
      message.channel.send("<:Wubby:665434218163208192>")
    },
    aliases: ["wubbzybeta", "betawubbzy"],
    description: "Wubby",
    permissions: {
      user: [0, 0],
      bot: [0, 0]
    }
}
