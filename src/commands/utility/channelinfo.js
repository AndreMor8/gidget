import { MessageEmbed, MessageButton, MessageActionRow } from "discord.js";

export default class extends Command {
  constructor(options) {
    super(options);
    this.description = "Show the info of a certain channel.";
    this.permissions = {
      user: [0n, 0n],
      bot: [0n, 16384n]
    };
  }
  async run(bot, message, args) {
    if (!message.guild) return message.channel.send("Yes, I know this is a channel, but there are no interesting things I can show you.");
    const obj = {
      text: "Text channel",
      voice: "Voice channel",
      category: "Category channel",
      news: "News channel",
      store: "Store channel",
      stage: "Stage channel",
      unknown: "Guild channel"
    };
    const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[1]) || message.guild.channels.cache.find(c => c.name.replace("#", "") === args.slice(1).join(" ")) || message.guild.channels.cache.find(c => c.parentID === message.channel.parentID && c.position === parseInt(args[1])) || await message.guild.channels.fetch(args[1] || "123").catch(() => { }) || message.channel;
    const embed = new MessageEmbed()
      .setTitle("Channel information for " + channel.name)
      .setColor("RANDOM")
      .setTimestamp()
      .addField("ID", channel.id, true)
      .addField("Type", obj[channel.type], true)
      .addField("Client things", "Can I see it?: " + (channel.viewable ? "Yes" : "No") + ("\nCan I manage/edit it?: " + (channel.manageable ? "Yes" : "No")) + (channel.type === "voice" ? (("\nCan I join it?: " + (channel.joinable ? "Yes" : "No")) + ("\nCan I speak in it?: " + ((channel.speakable) ? "Yes" : "No"))) : ""), true)
      .addField("Created At", bot.botIntl.format(channel.createdAt), true);
    if (channel.parent) {
      embed.addField("Parent", channel.parent.name + "\n`" + channel.parentID + "`", true);
      embed.addField("Synchronized with the channel's parent?", channel.permissionsLocked ? "Yes" : "No", true);
    }
    embed.addField("Position", channel.parent ? ("General: " + channel.position + "\nRaw: " + channel.rawPosition) : channel.position, true);
    switch (channel.type) {
      case 'news':
      case 'text':
        embed.addField("Pinned messages", channel.permissionsFor(bot.user.id).has("VIEW_CHANNEL") ? (await channel.messages.fetchPinned(false)).size.toString() : "*Without permissions for see that*", true)
          .addField("Last pin at", channel.lastPinAt ? bot.botIntl.format(channel.lastPinAt) : "*None*", true)
          .addField("NSFW?", channel.nsfw ? "Yes" : "No", true);
        if (channel.type !== "news") {
          embed.addField("Slowmode", channel.rateLimitPerUser + " seconds", true);
        }
        embed.addField("Topic", channel.topic || "*None*");
        break;
      case 'stage':
      case 'voice':
        embed.addField("Bitrate", channel.bitrate + " bps", true)
          .addField("Joined members", channel.members.size.toString(), true)
          .addField("User limit", channel.userLimit ? channel.userLimit : "*None*", true)
          .addField("Full?", channel.full ? "Yes" : "No", true);
          if(channel.type === "stage" && channel.instance) {
            embed.addField("Instance ID", channel.instance.id)
            .addField("Instance created at", bot.botIntl.format(channel.instance.createdAt))
            .addField("Discovery disabled?", channel.instance.discoverableDisabled ? "Yes" : "No")
            .addField("Privacy level", channel.instance.privacyLevel)
            .addField("Topic", channel.instance.topic || "*None*");
          }
        break;
      case 'category':
        embed.addField("Channels in this category", channel.children.size.toString(), true);
        break;
    }
    const but_link_msg = new MessageButton()
      .setStyle("LINK")
      .setURL(`https://discordapp.com/channels/${message.guild.id}/${channel.id}/${channel.lastMessageID}`)
      .setLabel("Last channel message")
      .setDisabled(channel.lastMessageID ? false : true);
    await message.channel.send({ embeds: [embed], components: ["news", "text"].includes(channel.type) ? [new MessageActionRow().addComponents([but_link_msg])] : undefined });
  }
}