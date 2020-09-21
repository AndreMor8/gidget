import Command from '../../utils/command.js';
import { MessageEmbed } from 'discord.js';

export default class extends Command {
  constructor(options) {
    super(options);
    this.description = "Receive a link to invite the bot";
  }
  async run(message, args) {
    message.channel.send(new MessageEmbed()
      .setTitle("Invite links!")
      .setColor("#848484")
      .setFooter("Requested by " + message.author.tag, message.author.displayAvatarURL({ dynamic: true }))
      .addField("Invite the bot to your server", await this.bot.generateInvite() + "\nThanks for adding it!")
      .addField("Support server", "https://discord.gg/KDy4gJ7")
      .addField("Wow Wow Discord", "https://discord.gg/5qx9ZcV\nIf you are a fan of the Wubbzy series, join this server! It's managed by 4 big fans of the series :)"));
  }
}