const Discord = require('discord.js');

module.exports = {
  run: async (bot, message, args) => {
    if (!message.guild) return message.channel.send('This command only works on servers.')
      function msg(role) {
        const mng = {
          true: 'Yes',
          false: 'No'
        }
        const mb = {
          true: 'Anyone',
          false: 'Mention Everyone perm'
        }
        const fullmembers = role.members.size;
        const bots = role.members.filter(m => m.user.bot).size;
        const members = fullmembers - bots;
        var mtext = '';
        var htxt = '';
        var btxt = '';
        
        if (bots == 1) {
          btxt += ' bot';
        } else {
          btxt += ' bots';
        }
        if (members == 1) {
          htxt += ' human';
        } else {
          htxt += ' humans'
        }
        
        if (bots == 0) {
          mtext += members + htxt;
        } else if (members == 0) {
          mtext += bots + btxt;
        } else {
          mtext += fullmembers + '\nHumans: ' + members + '\nBots: ' + bots;
        }
        
        const perms = role.permissions.toArray();
        
        if (perms.indexOf('ADMINISTRATOR') === -1) {
          var permstext = perms.join(', ') || "Without permissions.";
        } else {
          var permstext = 'ADMINISTRATOR (This role has all the permissions)';
        }
        
        let channel = args[args.length - 1];
    if (channel.charAt(0) == "-") {
      channel =
        message.mentions.channels.first() ||
        message.guild.channels.cache.get(channel.substring(1)) ||
        message.channel;
    } else {
      channel = message.channel;
    }
        
        const perms2 = role.permissionsIn(channel).toArray();
    let permstext2 = "";
    if (perms2.indexOf("ADMINISTRATOR") === -1) {
      permstext2 = perms2.join(", ") || "Without permissions.";
    } else {
      permstext2 = "ADMINISTRATOR (This role has all the permissions)";
    }
        
        const embed = new Discord.MessageEmbed()
        .setColor(role.hexColor)
        .setTitle('Information about ' + role.name)
        .addField('ID', role.id, true)
        .addField('Created At', role.createdAt.toLocaleString(), true)
        .addField('Mention', role.toString() + ' `' + role.toString() + '`', true)
        .addField('Managed?', mng[role.managed], true)
        .addField('Hoisted?', mng[role.hoist], true)
        .addField('Members ', mtext, true)
        .addField('Mentionable by', mb[role.mentionable], true)
        .addField('Color', 'Base 10: ' + role.color + '\nHex: ' + role.hexColor, true)
        .addField('Position', `Role Manager: ${role.position}\nAPI: ${role.rawPosition}`, true)
        .addField('Permissions', '`' + permstext + '`')
        .addField('Permissions (Overwrites)', '`' + permstext2 + '`')
        .setTimestamp()
        message.channel.send(embed);
      }
      
      if (!args[1]) {
        let role = message.member.roles.highest;
        msg(role);
      } else {
        let role = message.mentions.roles.first() || message.guild.roles.cache.get(args[1]) || message.guild.roles.cache.find(r => r.name === args.slice(1).join(" "));
        if (!role) return message.channel.send('That\'s not a valid role. Mention the role, type its name or put the ID.');
        msg(role);
      }
    },
    aliases: [],
    description: "Get information about a role",
}