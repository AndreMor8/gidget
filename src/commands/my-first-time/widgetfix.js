//Note that if you dont like this command you can delete it safely because i made this when i was new to discordjs and it is not neccesary to the bot
module.exports = {
    run: async (bot, message, args) => {
      let widget = ["Oops, that's not supposed to happen", "No problemo! <:WidgetWalk:610311126193930240>", "Oops, that wasn't supposed to happen", "I can fix anything <:WidgetFix:626764896184434690>"];
      message.channel.send(widget[Math.floor(Math.random() * 4)] + ".");
    },
    aliases: [],
    description: "Widget fix something",
    permissions: {
      user: [0, 0],
      bot: [0, 0]
    }
}
