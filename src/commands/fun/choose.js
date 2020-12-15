
import Discord from 'discord.js'

export default class extends Command {
  constructor(options) {
    super(options);
    this.description = "Random choose";
    this.permissions = {
      user: [0, 0],
      bot: [0, 16384]
    }
  }
  async run(bot, message, args) {
    const form = args.slice(1).join(" ");
    const tochoose = form.split(" | ")
    if(!tochoose[0] || !tochoose[1]) return message.channel.send('Usage: `choose <response1> | <response2> | <response(n)>`')
    const embed = new Discord.MessageEmbed()
    .setTitle('Choose!')
    .addField('To choose', tochoose.join(" - "))
    .addField('I choose...', `**${tochoose[Math.floor(Math.random() * tochoose.length)]}**`)
    .setColor("RANDOM")
    .setTimestamp();
    await message.channel.send(embed);
  }
}