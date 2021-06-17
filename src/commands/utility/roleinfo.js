import Discord from 'discord.js';

export default class extends Command {
  constructor(options) {
    super(options);
    this.description = "Get information about a role";
    this.guildonly = true;
    this.permissions = {
      user: [0n, 0n],
      bot: [0n, 16384n]
    };
  }
  async run(bot, message, args) {
    if (!message.guild) return message.channel.send('This command only works on servers.')
    async function msg(role) {
      const mng = {
        true: 'Yes',
        false: 'No'
      }
      const mb = {
        true: 'Anyone',
        false: 'Mention Everyone perm'
      }
      /*
      const fullmembers = role.members.size;
      const bots = role.members.filter(m => m.user.bot).size;
      const members = fullmembers - bots;
      let mtext = '';
      let htxt = '';
      let btxt = '';

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
*/
      const perms = role.permissions.toArray();
      let permstext = "";
      if (perms.indexOf('ADMINISTRATOR') === -1) {
        permstext = perms.join(', ') || "Without permissions.";
      } else {
        permstext = 'ADMINISTRATOR (This role has all the permissions)';
      }

      let channel = args[args.length - 1];
      if (channel.charAt(0) == "-") {
        channel =
          message.mentions.channels.filter(e => e.guild.id === message.guild.id).first() ||
          message.guild.channels.cache.get(channel.substring(1)) ||
          await message.guild.channels.fetch(channel.substring(1)).catch(() => { }) ||
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
        .addField('Created At', bot.botIntl.format(role.createdAt), true)
        .addField('Mention', role.toString() + ' `' + role.toString() + '`', true)
        .addField('Managed?', mng[role.managed], true)
        .addField('Hoisted?', mng[role.hoist], true)
        /*.addField('Members ', mtext, true)*/
        .addField('Mentionable by', mb[role.mentionable], true)
        .addField('Color', 'Base 10: ' + role.color + '\nHex: ' + role.hexColor, true)
        .addField('Position', `Role Manager: ${role.position}\nAPI: ${role.rawPosition}`, true)
        .addField('Permissions', '`' + permstext + '`')
        .addField('Permissions (Overwrites)', '`' + permstext2 + '`')
        .addField('Does it belong to a bot?', role.tags?.botID ? `**Yes** (${role.tags?.botID}, <@!${role.tags?.botID}>)` : "No", true)
        .addField('Does it belong to a integration?', role.tags?.integrationID ? `**Yes** (${role.tags?.integrationID})` : "No", true)
        .addField('Is this the role for boosters?', role.tags?.premiumSubscriberRole ? "**Yes**" : "No", true)
        .setTimestamp()
      await message.channel.send({ embeds: [embed] });
    }

    if (!args[1]) {
      const role = message.member.roles.highest;
      await msg(role);
    } else {
      const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[1]) || message.guild.roles.cache.find(r => r.name === args.slice(1).join(" "));
      if (!role) return message.channel.send('That\'s not a valid role. Mention the role, type its name or put the ID.');
      await msg(role);
    }
  }
}