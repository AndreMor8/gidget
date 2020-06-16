const Discord = require("discord.js");
const MessageModel = require("../../database/models/ticket");

module.exports = {
  run: async (bot, message, args) => {
    if(!message.guild) return message.channel.send('This command only works in servers');
    if (!message.guild.me.hasPermission("MANAGE_CHANNELS")) return message.channel.send("First give me the permission to manage channels, okay?")
    if (message.member.hasPermission("ADMINISTRATOR")) {
      if (!args[1]) return message.channel.send("Put a text channel");
      let channel =
        message.mentions.channels.first() ||
        message.guild.channels.cache.get(args[1]) ||
        message.guild.channels.cache.find(c => c.name === args[1]);
      if (!channel) return message.channel.send("Invalid channel!");
      if (channel.type !== "text") return message.channel.send("Invalid channel type!");
      if (!channel.permissionsFor(bot.user).has(["SEND_MESSAGES", "EMBED_LINKS"])) return message.channel.send("I don't have the `SEND_MESSAGES` and the `EMBED_LINKS` permission in that channel");
      if(!args[2]) return message.channel.send("Put a category channel!")
      let category =    message.guild.channels.cache.get(args[2]) ||
        message.guild.channels.cache.find(c => c.name === args[2]);
      if(!category) return message.channel.send("Invalid channel! (arg 2)");
      if (category.type !== "category") return message.channel.send("Invalid channel type! (arg 2)");
      if(!args[3]) return message.channel.send("Put a emoji!");
      let emoji;
      let inrevision = Discord.Util.parseEmoji(args[3]);
      if(!inrevision.id) {
        if(!message.guild.emojis.cache.find(e => e.name === inrevision.name) && !/^(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])$/gmi.test(inrevision.name)) return message.channel.send("Invalid emoji!");
        else {
          if(message.guild.emojis.cache.find(e => e.name === inrevision.name)) {
            emoji = message.guild.emojis.cache.find(e => e.name === inrevision.name).id;
          } else {
            emoji = inrevision.name
          }
        }
      } else {
        if (!bot.emojis.cache.get(inrevision.id)) return message.channel.send("Invalid emoji!");
        else emoji = bot.emojis.cache.get(inrevision.id).id;
      }
      if(!args[4]) return message.channel.send("Put a title for the ticket embed")
      try {
        const embed = new Discord.MessageEmbed()
        .setTitle(args.slice(4).join(" "))
        .setDescription('React with '+ (/^(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])$/gmi.test(emoji) ? emoji : bot.emojis.cache.get(emoji).toString())+' to create a ticket.')
        .setColor("BLUE")
        .setFooter('You can only have one ticket at a time');
        let msg = await channel.send(embed)
        await msg.react(emoji)
        let dbMsgModel = new MessageModel({
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
      dbMsgModel
        .save()
        .then(m => {
          console.log(m);
          message.channel.send("I'm listening!");
        })
      } catch (err) {
        message.channel.send(
            "Some error ocurred. Here's a debug: " +
              err
          );
      }
    } else {
      let msgDocument = await MessageModel.findOne({
        guildId: message.guild.id
      }).catch(err => console.log(err));
      if (msgDocument) {
        let { channelId, emojiId } = msgDocument;
        message.channel.send(`To create a ticket, go to <#${channelId}> and react with ${bot.emojis.cache.get(emojiId) ? bot.emojis.cache.get(emojiId).toString() : emojiId }`)
      } else {
        message.channel.send('I am not listening to tickets on this server.');
      }
    }
  },
  aliases: [],
  description: "Start listening tickets"
};
