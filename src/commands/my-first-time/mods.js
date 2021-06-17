import { MessageEmbed } from 'discord.js';

export default class extends Command {
  constructor(options) {
    super(options);
    this.aliases = [];
    this.onlyguild = true;
    this.description = "List of Mods";
    this.permissions = {
      user: [0n, 0n],
      bot: [0n, 16384n]
    };
  }
  async run(bot, message) {
    const fetch = message.guild.roles.cache.get('617518093480230912').members.map(m => m.user);
    const mods = fetch.join('\n');
    const embed = new MessageEmbed()
      .setTitle('List of Mods')
      .setDescription(mods)
    await message.channel.send({embeds: [embed]});
  }
}