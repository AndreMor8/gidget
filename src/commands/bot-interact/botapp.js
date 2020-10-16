import Command from '../../utils/command.js';
import { MessageEmbed } from "discord.js";

export default class extends Command {
  constructor(options) {
    super(options);
    this.description = "This fetches the actual bot application on Discord";
  }
  async run(bot, message, args) {
    let info = await bot.fetchApplication()
    const embed = new MessageEmbed()
    .setTitle("Client app information")
    .setThumbnail(info.iconURL({ format: "png" }))
    .setColor("YELLOW")
    .addField("Client ID", info.id)
    .addField("Application name", info.name)
    .addField("Description", info.description || "?")
    .addField("Public bot?", info.botPublic ? "Yes" : "No")
    .addField("Requires OAuth2 code grant?", info.botRequireCodeGrant ? "Yes" : "No")
    .addField("Owner", info.owner.toString())
    await message.channel.send(embed);
  }
}