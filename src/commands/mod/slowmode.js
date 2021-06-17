export default class extends Command {
  constructor(options) {
    super(options)
    this.aliases = [];
    this.description = "Edit the channel slowmode";
    this.guildonly = true;
    this.permissions = {
      user: [268435456n, 0n],
      bot: [0n, 16n]
    };

  }
  async run(bot, message, args) {
    if (!args[1]) return message.channel.send('Usage: `slowmode <seconds> <channel>`');
    const number = parseInt(args[1]);
    if((!number) && (number !== 0)) return message.channel.send("Invalid number");
    if (number > 21600 || number < 0) return message.channel.send('Invalid number. The number must be between 0 and 21600 seconds.');
    const channel = args[2] ? (message.guild.channels.cache.get(args[2]) || await message.guild.channels.fetch(args[2] || "123").catch(() => {}) || message.mentions.channels.first()) : message.channel;
    if (channel) await channel.edit({ rateLimitPerUser: number }, "Slowmode command").then(() => { message.channel.send('Slowmode changed to ' + number + ' seconds in ' + message.channel.toString()); }).catch(err => message.reply(`I couldn't change the slowmode. Here's a debug: ` + err));
    else await message.reply('That\'s not a valid channel');
  }
}