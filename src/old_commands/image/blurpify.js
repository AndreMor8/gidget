import { EmbedBuilder } from 'discord.js';

export default class extends Command {
  constructor(options) {
    super(options)
    this.description = "Blurpify some user avatar";
    this.permissions = {
      user: [0n, 0n],
      bot: [0n, 16384n]
    }
  }
  async run(bot, message) {
    const person = message.mentions.users.filter(u => u.id !== bot.user.id).first() || message.author;
    const msg = await message.channel.send("Blurpifying... (this may take a while)")
    const res = await fetch(`https://nekobot.xyz/api/imagegen?type=blurpify&image=${person.displayAvatarURL({ size: 1024, extension: "png" })}`);
    if (!res.ok) return await message.channel.send("Something happened with the third-party API")

    const body = await res.json();
    const embed = new EmbedBuilder()
      .setTitle(`${person.username} got blurpified`)
      .setImage(body.message)
      .setColor("Random")
    await msg.edit({ embeds: [embed] })
  }
}
