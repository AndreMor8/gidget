const Discord = require('discord.js');

module.exports = {
  run: async (bot, message, args) => {
    if (!message.guild) return message.channel.send('This command only works on servers.');
    
    let fullN = message.guild.emojis.cache.size;
    
    if (fullN < 1) return message.reply('I don\'t see any emoji here.');
    
    let commonN = message.guild.emojis.cache.filter(e => !e.animated && (e.roles.cache.size >= 1 ? e.roles.cache.intersect(message.guild.me.roles.cache).size >= 1 : true)).size;
    
    let animatedN = message.guild.emojis.cache.filter(e => e.animated && (e.roles.cache.size >= 1 ? e.roles.cache.intersect(message.guild.me.roles.cache).size >= 1 : true)).size;
    
    let cantuse = message.guild.emojis.cache.filter(e => e.roles.cache.size >= 1 ? e.roles.cache.intersect(message.guild.me.roles.cache).size < 1 : false).size;
    
    let atext = message.guild.emojis.cache.filter(e => e.animated && (e.roles.cache.size >= 1 ? e.roles.cache.intersect(message.guild.me.roles.cache).size >= 1 : true)).map(e => e.toString()).join(" ");
    
    let ntext = message.guild.emojis.cache.filter(e => !e.animated && (e.roles.cache.size >= 1 ? e.roles.cache.intersect(message.guild.me.roles.cache).size >= 1 : true)).map(e => e.toString()).join(" ");
    
    let ctext = message.guild.emojis.cache.filter(e => e.roles.cache.size >= 1 ? e.roles.cache.intersect(message.guild.me.roles.cache).size < 1 : false).map(e => e.name).join(", ");
    
    let realtext = "";
    
    let a = false;
    let n = false;
    
    if (animatedN > 0) {
      a = true;
      realtext += `**Animated (${animatedN}): ** ${atext}`
    }
    
    if (commonN > 0) {
      n = true;
      if(a) realtext += `\n\n**Common (${commonN}): ** ${ntext}`
      else realtext += `**Common (${commonN}): ** ${ntext}`
    }
    
    if (cantuse > 0) {
      if(n) realtext += `\n\n**I can't use (${cantuse}): ** ${ctext}`
      else realtext += `**I can't use (${cantuse}): ** ${ctext}`
    }
    
    message.channel.send(realtext, { split: { char: " " } });
  },
  aliases: [],
  description: "Show all guild emojis"
}