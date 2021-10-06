import { MessageEmbed, MessageButton, MessageActionRow } from "discord.js";

export default class extends SlashCommand {
  constructor(options) {
    super(options);
    this.deployOptions.description = "Show the info of a certain channel.";
    this.deployOptions.options = [{
      name: "channel",
      description: "The channel to obtain information...",
      type: "CHANNEL",
      required: true
    }];
    this.permissions = {
      user: [0n, 0n],
      bot: [0n, 16384n]
    };
  }
  async run(bot, interaction) {
    if (!interaction.guild) return interaction.reply("Yes, I know this is a channel, but there are no interesting things I can show you.");
    const obj = {
      GUILD_TEXT: "Text channel",
      GUILD_VOICE: "Voice channel",
      GUILD_CATEGORY: "Category channel",
      GUILD_NEWS: "News channel",
      GUILD_STORE: "Store channel",
      GUILD_STAGE_VOICE: "Stage channel",
      GUILD_NEWS_THREAD: "Thread channel from news channel",
      GUILD_PUBLIC_THREAD: "Public thread channel",
      GUILD_PRIVATE_THREAD: "Private thread channel",
      UNKNOWN: "Guild channel"
    };
    const obj2 = {
      60: "1 hour",
      1440: "1 day",
      4320: "3 days",
      10080: "1 week"
    }
    const channel = interaction.options.getChannel('channel', false) || interaction.channel;
    const embed = new MessageEmbed()
      .setTitle("Channel information for " + channel.name)
      .setColor("RANDOM")
      .setTimestamp()
      .addField("ID", channel.id, true)
      .addField("Type", obj[channel.type], true)
      .addField("Client things", (!channel.isThread() ? "Can I see it?: " + (channel.viewable ? "Yes" : "No") : "") + ("\nCan I manage it?: " + (channel.manageable ? "Yes" : "No")) + (channel.type === "GUILD_VOICE" ? (("\nCan I join it?: " + (channel.joinable ? "Yes" : "No")) + ("\nCan I speak in it?: " + ((channel.speakable) ? "Yes" : "No"))) : "") + (channel.isThread() ? ("\nCan I join it?: " + (channel.joinable ? "Yes" : "No")) + ("\nCan I edit it?: " + (channel.editable ? "Yes" : "No")) + ("\nCan I send messages on it?: " + (channel.sendable ? "Yes" : "No")) + ("\nCan I unarchive it?: " + (channel.unarchivable ? "Yes" : "No")) : ""), true)
      .addField("Created At", bot.botIntl.format(channel.createdAt), true);
    if (channel.parentId) {
      embed.addField("Parent", `<#${channel.parentId}>\n\`${channel.parentId}\``, true);
      if (!channel.isThread()) embed.addField("Synchronized with the channel's parent?", channel.permissionsLocked ? "Yes" : "No", true);
    }
    if (!channel.isThread()) embed.addField("Position", channel.parent ? ("General: " + channel.position.toString() + "\nRaw: " + channel.rawPosition.toString()) : channel.position.toString(), true);
    switch (channel.type) {
      case 'GUILD_NEWS':
      case 'GUILD_TEXT':
        embed.addField("Pinned messages", channel.permissionsFor(bot.user.id).has("VIEW_CHANNEL") ? (await channel.messages.fetchPinned(false).catch(() => { return { size: "*Without permissions for see that*" } })).size.toString() : "*Without permissions for see that*", true)
          .addField("Last pin at", channel.lastPinAt ? bot.botIntl.format(channel.lastPinAt) : "*None*", true)
          .addField("NSFW?", channel.nsfw ? "Yes" : "No", true);
        if (channel.type !== "GUILD_NEWS") {
          embed.addField("Slowmode", channel.rateLimitPerUser + " seconds", true);
        }
        embed.addField("Threads on this channel", channel.threads.cache.size.toString(), true)
        embed.addField("Topic", channel.topic || "*None*");
        break;
      case 'GUILD_STAGE_VOICE':
      case 'GUILD_VOICE':
        embed.addField("Bitrate", channel.bitrate + " bps", true)
          .addField("Joined members", channel.members.size.toString(), true)
          .addField("User limit", channel.userLimit ? channel.userLimit.toString() : "*None*", true)
          .addField("Full?", channel.full ? "Yes" : "No", true);
        if (channel.type === "GUILD_STAGE_VOICE" && channel.instance) {
          embed.addField("Instance ID", channel.instance.id, true)
            .addField("Instance created at", bot.botIntl.format(channel.instance.createdAt), true)
            .addField("Discovery disabled?", channel.instance.discoverableDisabled ? "Yes" : "No", true)
            .addField("Privacy level", channel.instance.privacyLevel, true)
            .addField("Topic", channel.instance.topic || "*None*");
        }
        break;
      case 'GUILD_CATEGORY':
        embed.addField("Channels in this category", channel.children.size.toString(), true);
        break;
      case 'GUILD_NEWS_THREAD':
      case 'GUILD_PUBLIC_THREAD':
      case 'GUILD_PRIVATE_THREAD':
        embed
          .addField("Thread creator", `<@!${channel.ownerId}> (${channel.ownerId})`, true)
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
      .setURL(`https://discordapp.com/channels/${interaction.guild.id}/${channel.id}/${channel.lastMessageId}`)
      .setLabel("Last channel message")
      .setDisabled(channel.lastMessageId ? false : true);
    await interaction.reply({ embeds: [embed], components: channel.isText() ? [new MessageActionRow().addComponents([but_link_msg])] : undefined });
  }
}