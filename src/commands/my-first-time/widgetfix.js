module.exports = {
    run: async (bot, message, args) => {
      let widget = ["Oops, that's not supposed to happen", "No problemo! <:WidgetWalk:610311126193930240>", "Oops, that wasn't supposed to happen", "I can fix anything <:WidgetFix:626764896184434690>"];
      message.channel.send(widget[Math.floor(Math.random() * 4)] + ".");
    },
    aliases: [],
    description: "Widget fix something",
}