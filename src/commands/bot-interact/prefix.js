export default class extends Command {
  constructor(options) {
    super(options);
    this.description = "Change the bot prefix";
    this.guildonly = true;
    this.permissions = {
      user: [8n, 0n],
      bot: [0n, 0n]
    }
  }
  async run(bot, message, args) {
    if (!args[1]) return await message.channel.send('The actual prefix is ' + (message.guild.cache.prefix ? message.guild.prefix : await message.guild.getPrefix()));
    const thing = await message.guild.setPrefix(args.slice(1).join(" "));
    await message.channel.send(`Now the new server prefix is ${thing}`);
  }
}