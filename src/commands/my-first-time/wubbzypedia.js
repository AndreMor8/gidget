//Note that if you dont like this command you can delete it safely because i made this when i was new to discordjs and it is not neccesary to the bot
module.exports = {
    run: async (bot, message, args) => {
      if(!message.guild) return message.channel.send('This command only works on Wow Wow Discord.')
      if (message.guild.id !== '402555684849451028') return message.channel.send('This command only works on Wow Wow Discord.')
      message.channel.send('Wubbzypedia is the best wiki for all the information of the series Wow! Wow! Wubbzy!, the characters, episodes, merchandise and much more! Here is the link: https://wubbzy.fandom.com/')
    },
    aliases: ["wiki"],
    description: "Link to Wubbzypedia",
}
