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
      news_thread: "Thread channel from news channel",
      public_thread: "Public thread channel",
      private_thread: "Private thread channel",
      unknown: "Guild channel"
    };
    const obj2 = {
      60: "1 hour",
      1440: "1 day",
      4320: "3 days",
      10080: "1 week"
    }
    const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[1]) || message.guild.channels.cache.find(c => c.name.replace("#", "") === args.slice(1).join(" ")) || message.guild.channels.cache.find(c => c.parentID === message.channel.parentID && c.position === parseInt(args[1])) || (args[1] ? await message.guild.channels.fetch(args[1] || "123").catch(() => { }) : undefined) || message.channel;
    if (channel.guild.id !== message.guild.id) return message.channel.send("That channel is from another server!");
    const embed = new MessageEmbed()
      .setTitle("Channel information for " + channel.name)
      .setColor("RANDOM")
      .setTimestamp()
      .addField("ID", channel.id, true)
      .addField("Type", obj[channel.type], true)
      .addField("Client things", (!["news_thread", "public_thread", "private_thread"].includes(channel.type) ? "Can I see it?: " + (channel.viewable ? "Yes" : "No") : "") + ("\nCan I manage it?: " + (channel.manageable ? "Yes" : "No")) + (channel.type === "voice" ? (("\nCan I join it?: " + (channel.joinable ? "Yes" : "No")) + ("\nCan I speak in it?: " + ((channel.speakable) ? "Yes" : "No"))) : "") + (["news_thread", "public_thread", "private_thread"].includes(channel.type) ? ("\nCan I join it?: " + (channel.joinable ? "Yes" : "No")) + ("\nCan I edit it?: " + (channel.editable ? "Yes" : "No")) + ("\nCan I send messages on it?: " + (channel.sendable ? "Yes" : "No")) + ("\nCan I unarchive it?: " + (channel.unarchivable ? "Yes" : "No")) : ""), true)
      .addField("Created At", bot.botIntl.format(channel.createdAt), true);
    if (channel.parentID) {
      embed.addField("Parent", `<#${channel.parentID}>\n\`${channel.parentID}\``, true);
      if (!["news_thread", "public_thread", "private_thread"].includes(channel.type)) embed.addField("Synchronized with the channel's parent?", channel.permissionsLocked ? "Yes" : "No", true);
    }
    if (!["news_thread", "public_thread", "private_thread"].includes(channel.type)) embed.addField("Position", channel.parent ? ("General: " + channel.position + "\nRaw: " + channel.rawPosition) : channel.position, true);
    switch (channel.type) {
      case 'news':
      case 'text':
        embed.addField("Pinned messages", channel.permissionsFor(bot.user.id).has("VIEW_CHANNEL") ? (await channel.messages.fetchPinned(false)).size.toString() : "*Without permissions for see that*", true)
          .addField("Last pin at", channel.lastPinAt ? bot.botIntl.format(channel.lastPinAt) : "*None*", true)
          .addField("NSFW?", channel.nsfw ? "Yes" : "No", true);
        if (channel.type !== "news") {
          embed.addField("Slowmode", channel.rateLimitPerUser + " seconds", true);
        }
        embed.addField("Threads on this channel", channel.threads.cache.size.toString(), true)
        embed.addField("Topic", channel.topic || "*None*");
        break;
      case 'stage':
      case 'voice':
        embed.addField("Bitrate", channel.bitrate + " bps", true)
          .addField("Joined members", channel.members.size.toString(), true)
          .addField("User limit", channel.userLimit ? channel.userLimit.toString() : "*None*", true)
          .addField("Full?", channel.full ? "Yes" : "No", true);
        if (channel.type === "stage" && channel.instance) {
          embed.addField("Instance ID", channel.instance.id, true)
            .addField("Instance created at", bot.botIntl.format(channel.instance.createdAt), true)
            .addField("Discovery disabled?", channel.instance.discoverableDisabled ? "Yes" : "No", true)
            .addField("Privacy level", channel.instance.privacyLevel, true)
            .addField("Topic", channel.instance.topic || "*None*");
        }
        break;
      case 'category':
        embed.addField("Channels in this category", channel.children.size.toString(), true);
        break;
      case 'news_thread':
      case 'public_thread':
      case 'private_thread':
        embed
          .addField("Thread creator", `<@!${channel.ownerID}> (${channel.ownerID})`, true)
          .addField("Archived?", channel.archived ? `Yes, since ${bot.botIntl.format(channel.archivedAt)}` : "No", true)
          .addField("It will autoarchive in", `${obj2[channel.autoArchiveDuration]}`, true)
          .addField("Thread members", channel.memberCount >= 50 ? `+50 (${channel.members.cache.size}) cached` : channel.memberCount.toString(), true)
          .addField("Locked?", channel.locked ? "Yes" : "No", true)
          .addField("Slowmode", channel.rateLimitPerUser + " seconds", true)
          .addField("\u200b", "\u200b", true)
          .addField("Pinned messages", channel.permissionsFor(bot.user.id).has("VIEW_CHANNEL") ? (await channel.messages.fetchPinned(false)).size.toString() : "*Without permissions for see that*", true)
          .addField("Last pin at", channel.lastPinAt ? bot.botIntl.format(channel.lastPinAt) : "*None*", true)
    }
    const but_link_msg = new MessageButton()
      .setStyle("LINK")
      .setURL(`https://discordapp.com/channels/${message.guild.id}/${channel.id}/${channel.lastMessageID}`)
      .setLabel("Last channel message")
      .setDisabled(channel.lastMessageID ? false : true);
    await message.channel.send({ embeds: [embed], components: channel.isText() ? [new MessageActionRow().addComponents([but_link_msg])] : undefined });
  }
}