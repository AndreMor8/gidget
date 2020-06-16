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
}