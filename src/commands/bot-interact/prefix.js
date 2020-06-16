const Discord = require('discord.js');
const fs = require('fs');

module.exports = {
    run: async (bot, message, args) => {
      if (!message.guild) return message.channel.send('This command only works on servers.')
      if(!message.member.hasPermission("ADMINISTRATOR")) return message.reply(`You do not have permission to execute this command.`)
      if(!args[1]) return message.channel.send('Tell me a prefix!')
      if(args[2]) return message.channel.send('I\'m not compatible with spaces, sorry.')
      
      let prefixes = JSON.parse(fs.readFileSync("./prefixes.json", "utf8"));
      
      prefixes[message.guild.id] = {
        prefixes: args[1]
      };
      
      fs.writeFile("./prefixes.json", JSON.stringify(prefixes), (err) => {
        if(err) return message.channel.send('There was a problem saving the prefix in my memory. Here\'s a debug: ' + err)
      })
      
      message.channel.send('I\'ve changed the prefix of this server to: ' + args[1])
    },
    aliases: ['p'],
    description: "Change the prefix of the server",
}