import { MessageEmbed } from "discord.js";
export default class extends Command {
  constructor(options) {
    super(options);
    this.aliases = ["fi", "fthinv"]
    this.description = "Get the information from a Discord invite, using natural methods"
  }
  async run(bot, message, args) {
    if (message.deletable) message.delete();
    if (!args[1]) return message.channel.send("Usage: `fetchinvite <InviteResolvable>`\nAn InviteResolvable can be a URL invite or a invite code");
    try {
      const invite = await bot.fetchInvite(args[1])
      const embed = new MessageEmbed()
        .setDescription("The API doesn't give me as much information about a Discord invite")
        .setFooter("Requested by: " + message.author.tag, message.author.displayAvatarURL({ dynamic: true }))
        .setColor("RANDOM");
      if (invite.guild) {
        embed.setAuthor("Invite information", invite.guild.iconURL({ dynamic: true }))
          .addField("Guild", invite.guild.name + "\n`" + invite.guild.id + "`", true)
          .addField("Guild Verification", invite.guild.verificationLevel, true)
          .addField("Presence Count", invite.presenceCount.toString(), true)
      } else if (invite.channel.type === "group") {
        embed.setThumbnail(invite.channel.iconURL({ dynamic: true }))
          .addField("Type", "Group DM invite", true)
          .addField("Group name", invite.channel.name ? invite.channel.name : "None", true)
      }
      embed.addField("Member Count", invite.memberCount.toString(), true)
      if (invite.guild) {
        embed.addField("Redirects to", invite.channel.name + "\n" + invite.channel.toString(), true)
        embed.addField("\u200b", "\u200b", true)
          .addField("Features", invite.guild.features.join("\n") ? invite.guild.features.join("\n") : "Without features", true)
        if (invite.guild.splashURL()) {
          embed.setThumbnail(invite.guild.splashURL({ format: "png" }))
        }
        if (invite.guild.bannerURL()) {
          embed.setImage(invite.guild.bannerURL({ format: "png" }))
        }
      }
      embed.addField("Inviter", invite.inviter ? invite.inviter.tag + "\n" + invite.inviter.toString() : "None", true)
      await message.channel.send({embeds: [embed]});
    } catch (err) {
      if (err.message === "Unknown Invite") return message.channel.send("The API says that invitation is unknown.");
      else return message.channel.send("Something happened when I was trying to collect the information. Here's a debug: " + err);
    }
  }
}