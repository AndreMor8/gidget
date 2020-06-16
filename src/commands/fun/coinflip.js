const Discord = require('discord.js');

module.exports = {
    run: async (bot, message, args) => {
      var options = ['Heads', 'Tails'];
      
      var output = options[Math.floor(Math.random()*options.length)];
      
      message.channel.send(`You got: **${output}**!`);
    },
    aliases: [],
    description: "Coin flip",
}