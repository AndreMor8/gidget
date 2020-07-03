//Note that if you dont like this command you can delete it safely because i made this when i was new to discordjs and it is not neccesary to the bot
module.exports = {
    run: async (bot, message, args) => {
      if(!message.guild) return message.channel.send('This command only works on Wow Wow Discord.')
      if (message.guild.id !== '402555684849451028') return message.channel.send('This command only works on Wow Wow Discord.')
      let mods = message.guild.roles.cache.get("617518093480230912")
      let map = mods.members.map(m => m.user.username);
      let i = mods.members.size;
      let text = "The best mod is:"
      let reason = ["For being friendly", "For supporting a lot", "For being responsible", "For doing a great job", "For doing great help to the community", "For being a big fan of the series"]
      message.channel.send(text + " **" + map[Math.floor(Math.random() * i)] + "** \n" + "**Reason:** " + reason[Math.floor(Math.random() * 6)])
    },
    aliases: [],
    description: "Who is the best mod?",
}
