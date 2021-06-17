import Discord from "discord.js";
import MessageModel from "../../database/models/ticket.js";

export default class extends Command {
  constructor(options) {
    super(options);
    this.description = "Start listening tickets";
    this.guildonly = true;
    this.permissions = {
      user: [0n, 0n],
      bot: [16n, 0n]
    };
  }
  async run(bot, message, args) {
    if (message.member.permissions.has("ADMINISTRATOR")) {
      if (!args[1]) return message.channel.send("Put a text channel");
      const channel =
        message.mentions.channels.filter(e => e.guild.id !== message.guild.id).first() ||
        message.guild.channels.cache.get(args[1]) ||
        message.guild.channels.cache.find(c => c.name === args[1]) || await message.guild.channels.fetch(args[1] || "123").catch(() => { });
      if (!channel) return message.channel.send("Invalid channel! (arg 1)");
      if (channel.type !== "text") return message.channel.send("Invalid channel type! (arg 1)");
      if (!channel.permissionsFor(bot.user.id).has(["SEND_MESSAGES", "EMBED_LINKS"])) return message.channel.send("I don't have the `SEND_MESSAGES` and the `EMBED_LINKS` permission in that channel");
      if (!args[2]) return message.channel.send("Put a category channel!")
      const category = message.guild.channels.cache.get(args[2]) ||
        message.guild.channels.cache.find(c => c.name === args[2]) || await message.guild.channels.fetch(args[2] || "123").catch(() => { });
      if (!category) return message.channel.send("Invalid channel! (arg 2)");
      if (category.type !== "category") return message.channel.send("Invalid channel type! (arg 2)");
      if (!args[3]) return message.channel.send("Put a emoji!");
      let emoji;
      const inrevision = Discord.Util.parseEmoji(args[3]);
      if (!inrevision.id) {
        if (!message.guild.emojis.cache.find(e => e.name === inrevision.name) && !/(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/gmi.test(inrevision.name)) return message.channel.send("Invalid emoji!");
        else {
          if (message.guild.emojis.cache.find(e => e.name === inrevision.name)) {
            emoji = message.guild.emojis.cache.find(e => e.name === inrevision.name).id;
          } else {
            emoji = inrevision.name
          }
        }
      } else {
        const emojiobj = bot.emojis.cache.get(inrevision.id) || await message.guild.emojis.fetch(inrevision.id).catch(() => { });
        if (!emojiobj) return message.channel.send("Invalid emoji!");
        else emoji = emojiobj.id;
      }
      if (!args[4]) return message.channel.send("Put a title for the ticket embed")
      try {
        const embed = new Discord.MessageEmbed()
          .setTitle(args.slice(4).join(" "))
          .setDescription('React with ' + (/(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/gmi.test(emoji) ? emoji : bot.emojis.cache.get(emoji).toString()) + ' to create a ticket.')
          .setColor("BLUE")
          .setFooter('You can only have one ticket at a time');
        const msg = await channel.send({ embeds: [embed] });
        await msg.react(emoji);
        const dbMsgModel = new MessageModel({
          guildId: message.guild.id,
          channelId: channel.id,
          messageId: msg.id,
          emojiId: emoji,
          categoryId: category.id,
          perms: ["ADMINISTRATOR"],
          roles: [],
          manual: true,
          welcomemsg: "I've created your ticket correctly, %AUTHOR%",
          desc: "Ticket from %AUTHOR%"
        });
        await dbMsgModel
          .save()
          .then(() => message.channel.send("I'm listening!"));
      } catch (err) {
        await message.channel.send("Some error ocurred. Here's a debug: " + err);
      }
    } else {
      const msgDocument = await MessageModel.findOne({
        guildId: message.guild.id
      }).catch(err => console.log(err));
      if (msgDocument) {
        const { channelId, emojiId } = msgDocument;
        await message.channel.send(`To create a ticket, go to <#${channelId}> and react with ${bot.emojis.cache.get(emojiId) ? bot.emojis.cache.get(emojiId).toString() : emojiId}`)
      } else {
        await message.channel.send('I am not listening to tickets on this server.');
      }
    }
  }
}
