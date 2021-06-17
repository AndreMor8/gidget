import Discord from 'discord.js';

export default class extends Command {
  constructor(options) {
    super(options);
    this.onlyguild = true;
    this.description = "List of admins";
    this.permissions = {
      user: [0n, 0n],
      bot: [0n, 16384n]
    };
  }
  async run(bot, message) {
    const fetch = message.guild.roles.cache
      .get("402559343540568084")
      .members.map(m => m.user);
    const admins = fetch.join("\n");
    const embed = new Discord.MessageEmbed()
      .setTitle("List of Admins")
      .setDescription(admins);
    await message.channel.send({embeds: [embed]});
  }
}