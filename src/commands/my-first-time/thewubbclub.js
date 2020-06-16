module.exports = {
    run: async (bot, message, args) => {
      if(!message.guild) return message.channel.send('This command only works on Wow Wow Discord.')
      if (message.guild.id !== '402555684849451028') return message.channel.send('This command only works on Wow Wow Discord.')
      message.channel.send('In The Wubb Club is all the related fanmade of the Wow! Wow! Wubbzy! series. If you have ypur own fanmade of this series, you can add it here without problems! Here is the link: https://wubbzyfanon.fandom.com/ ')
    },
    aliases: ["twc", "wubbzyfanon"],
    description: "Link to the Wubb Club Wiki",
}