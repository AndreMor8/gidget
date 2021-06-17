import { MessageEmbed } from "discord.js";

export default class extends Command {
  constructor(options) {
    super(options)
    this.aliases = ["nw", "warns"];
    this.description = "It shows the warnings that the user has.";
    this.guildonly = true;
  }
  async run(bot, message, args) {
    const member = message.mentions.members.first() || message.guild.members.cache.get(args[1]) || (args[1] ? (await message.guild.members.fetch(args[1] || "123").catch(() => {})) : null) || (args[1] ? null : message.member);
    if(!member) return message.channel.send("Invalid member!");
    const warns = member.cache.warns ? member.warns : await member.getWarns();
    if(warns.length < 1) return message.channel.send("This member has no warnings.");
    const embed = new MessageEmbed()
    .setTitle(`Warnings of ${member.user.tag}`)
    .setFooter("Contact an admin to see how to be pardoned.");
    for(const i in warns) {
      embed.addField(`Case #${parseInt(i) + 1}`, `ID: ${warns[i]._id}\nReason: ${warns[i].reason || "*None*"}`);
    }
    message.channel.send({embeds: [embed]});
  }
}