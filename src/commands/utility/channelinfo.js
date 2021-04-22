import { MessageEmbed } from "discord.js";

export default class extends Command {
  constructor(options) {
    super(options);
    this.description = "Show the info of a certain channel.";
    this.permissions = {
      user: [0, 0],
      bot: [0, 16384]
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
      unknown: "Guild channel"
    };
    const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[1]) || message.guild.channels.cache.find(c => c.name.replace("#", "") === args.slice(1).join(" ")) || message.guild.channels.cache.find(c => c.parentID === message.channel.parentID && c.position === parseInt(args[1])) || await message.guild.channels.fetch(args[1] || "123").catch(() => {}) || message.channel;
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
        embed.addField("Last message", channel.lastMessage ? (`ID: ${channel.lastMessage.id}\nURL: [Click here](${channel.lastMessage.url})`) : (channel.lastMessageID ? (`ID: ${channel.lastMessageID}\nURL: [Click here](https://discordapp.com/channels/${message.guild.id}/${channel.id}/${channel.lastMessageID})`) : "Without fetch about that"), true)
          .addField("Number of members who can see it", channel.members.size, true)
          .addField("Pinned messages", channel.permissionsFor(bot.user.id).has("VIEW_CHANNEL") ? (await channel.messages.fetchPinned(false)).size : "*Without permissions for see that*", true)
          .addField("Last pin at", channel.lastPinAt ? bot.botIntl.format(channel.lastPinAt) : "None", true)
          .addField("NSFW?", channel.nsfw ? "Yes" : "No", true);
        if (channel.type !== "news") {
          embed.addField("Slowmode", channel.rateLimitPerUser + " seconds", true);
        }
        embed.addField("Topic", channel.topic || "None");
        break;
      case 'voice':
        embed.addField("Bitrate", channel.bitrate + " bps", true)
          .addField("Joined members", channel.members.size, true)
          .addField("User limit", channel.userLimit ? channel.userLimit : "None", true)
          .addField("Full?", channel.full ? "Yes" : "No", true);
        break;
      case 'category':
        embed.addField("Channels in this category", channel.children.size, true);
        break;
    }
 await message.channel.send(embed);
  }
}