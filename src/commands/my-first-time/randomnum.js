//Note that if you dont like this command you can delete it safely because i made this when i was new to discordjs and it is not neccesary to the bot
module.exports = {
    run: async (bot, message, args) => {
      if(args[1].length > 11) return message.channel.send("I don't think I can handle that.")
      let number = parseInt(args[1])
      if (!isNaN(number)){
        message.channel.send(Math.floor(Math.random() * number))
      } else {
        message.channel.send(Math.floor(Math.random() * 100))
      }
    },
    aliases: ["number", "random", "numrandom", "randomnumber", "numberrandom", "rn"],
    description: "Random number",
    permissions: {
      user: [0, 0],
      bot: [0, 0]
    }
}
