const Discord = require("discord.js");
const ms = require("ms");
const MessageModel = require("../../database/models/poll");
const interval = require("../../utils/poll");
module.exports = {
  run: async (bot, message, args) => {
    if (!args[1]) return message.channel.send("Usage: `poll <time> [<emoji1>, <emoji2>, <emoji(n)>] <text>`");
    let time = ms(args[1]);
    if (typeof time !== "number" || time < 40000) return message.channel.send("Invalid time! Must be 40 seconds or more.");
    return cmd_umfrage(message, args.slice(2));

    function toEmojis(args) {
      var text = args.join(" ");
      var regex = /(<a?:)(\d+)(>)/g;
      if (regex.test(text)) {
        regex.lastIndex = 0;
        var emojis = bot.emojis;
        var entry = null;
        while ((entry = regex.exec(text)) !== null) {
          if (emojis.has(entry[2])) {
            text = text.replaceSave(entry[0], emojis.get(entry[2]).toString());
          } else {
            text = text.replaceSave(
              entry[0],
              entry[1] + "unknown_emoji:" + entry[2] + entry[3]
            );
          }
        }
        return text.split(" ");
      } else return args;
    }

    function cmd_umfrage(msg, args) {
      var imgs = [];
      if (msg.guild.me.hasPermission("ATTACH_FILES"))
        imgs = msg.attachments.map(function(img) {
          return { attachment: img.url, name: img.filename };
        });
      if (args.length || imgs.length) {
        var text = args.join(" ").split("\n");
        args = text.shift().split(" ");
        if (text.length) args.push("\n" + text.join("\n"));
        var reactions = [];
        args = toEmojis(args);
        for (let i = 0; i < args.length || imgs.length; i++) {
          var reaction = args[i];
          var custom = /^<a?:/;
          var pattern = /^[\u0000-\u1FFF]{1,4}$/;
          if (
            !custom.test(reaction) &&
            (reaction.length > 4 || pattern.test(reaction))
          ) {
            cmd_sendumfrage(
              msg,
              args
                .slice(i)
                .join(" ")
                .replace(/^\n| (\n)/, "$1"),
              reactions,
              imgs
            );
            break;
          } else if (reaction !== "") {
            if (custom.test(reaction)) {
              reaction = reaction.substring(
                reaction.lastIndexOf(":") + 1,
                reaction.length - 1
              );
            }
            reactions[i] = reaction;
            if (i === args.length - 1) {
              cmd_sendumfrage(
                msg,
                args
                  .slice(i + 1)
                  .join(" ")
                  .replace(/^\n| (\n)/, "$1"),
                reactions,
                imgs
              );
              break;
            }
          }
        }
      } else {
        msg.channel.send("Usage: `poll <time> [<emoji1>, <emoji2>, <emoji(n)>] <text>`");
      }
    }

    function cmd_sendumfrage(msg, text, reactions, imgs) {
      if (!text) {
        text = "Image";
      }
      let mentions = "";
      const embed = new Discord.MessageEmbed()
      .setTitle("Poll")
      .setDescription(text)
      .setFooter("Made by: " + msg.author.tag + ", finish date:", msg.author.displayAvatarURL({ dynamic: true }))
      .setColor("RANDOM")
      .setTimestamp(new Date(new Date().getTime() + time));
      if (msg.member.hasPermission("MENTION_EVERYONE")) {
        if(msg.mentions.everyone) {
          if(msg.content.includes("@everyone")) {
            mentions += "@everyone ";
          }
          if(msg.content.includes("@here")) {
            mentions += "@here ";
          }
        }
        mentions += msg.mentions.roles.map(r => r.toString()).join(" ");
      }
      msg.channel
        .send({
          content: mentions,
          embed: embed,
          allowedMentions: { parse: (msg.member.hasPermission("MENTION_EVERYONE") ? ["users", "everyone", "roles"] : []) },
          files: imgs
        })
        .then(
          poll => {
            msg.delete();
            if (reactions.length) {
              reactions.forEach(function(entry) {
                poll.react(entry).catch(error => {
                  console.log(error);
                });
              });
            } else {
              poll.react("460279003673001985");
              poll.react("612137351166033950");
            }
            let newMessage = new MessageModel({
              messageId: poll.id,
              channelId: poll.channel.id,
              date: new Date(Date.now() + time),
              reactions: reactions.length ? reactions : ["460279003673001985", "612137351166033950"]
            })
            newMessage.save().then(() => interval(true)).catch(err => msg.channel.send("Could not save the message and the time in database."));
          },
          error => {
            console.log(error);
            msg.react("❌");
          }
        );
    }
  },
  aliases: [],
  description: "Reaction poll system"
};