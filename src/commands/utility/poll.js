//Needs update for infinite polls
import Discord from "discord.js";
import ms from "ms";
import MessageModel from "../../database/models/poll.js";

import interval from "../../utils/poll.js";

export default class extends Command {
  constructor(options) {
    super(options);
    this.description = "Reaction poll system";
    this.guildonly = true;
    this.permissions = {
      user: [0, 0],
      bot: [0, 16384]
    };
  }
  // eslint-disable-next-line require-await
  async run(bot, message, args) {
    if (!args[1]) return message.channel.send("Usage: `poll <time> [<emoji1>, <emoji2>, <emoji(n)>] <text>`");
    const time = ms(args[1]);
    if (typeof time !== "number" || time < 40000) return message.channel.send("Invalid time! Must be 40 seconds or more.");
    return cmd_umfrage(message, args.slice(2));

    /**
     * @param args
     */
    function toEmojis(args) {
      let text = args.join(" ");
      const regex = /(<a?:)(\d+)(>)/g;
      if (regex.test(text)) {
        regex.lastIndex = 0;
        const emojis = bot.emojis;
        let entry = null;
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

    /**
     * @param msg
     * @param args
     */
    function cmd_umfrage(msg, args) {
      let imgs = [];
      if (msg.guild.me.hasPermission("ATTACH_FILES"))
        imgs = msg.attachments.map(function (img) {
          return { attachment: img.url, name: img.filename };
        });
      if (args.length || imgs.length) {
        const text = args.join(" ").split("\n");
        args = text.shift().split(" ");
        if (text.length) args.push("\n" + text.join("\n"));
        const reactions = [];
        const toreact = [];
        args = toEmojis(args);
        const custom = /^<a?:/;
        // eslint-disable-next-line no-control-regex
        const pattern = /^[\u0000-\u1FFF]{1,4}$/;
        for (let i = 0; i < args.length || imgs.length; i++) {
          let reaction = args[i];
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
              imgs,
              toreact
            );
            break;
          } else if (reaction !== "") {
            if (custom.test(reaction)) {
              toreact.push(reaction);
              reaction = reaction.substring(
                reaction.lastIndexOf(":") + 1,
                reaction.length - 1
              );
            }
            reactions.push(reaction);
            if (i === args.length - 1) {
              cmd_sendumfrage(
                msg,
                args
                  .slice(i + 1)
                  .join(" ")
                  .replace(/^\n| (\n)/, "$1"),
                reactions,
                imgs,
                toreact
              );
              break;
            }
          }
        }
      } else {
        msg.channel.send("Usage: `poll <time> [<emoji1>, <emoji2>, <emoji(n)>] <text>`");
      }
    }

    /**
     * @param msg
     * @param text
     * @param reactions
     * @param imgs
     */
    function cmd_sendumfrage(msg, text, reactions, imgs, toreact) {
      if (!text) {
        text = "Image";
      }
      let mentions = "";
      const embed = new Discord.MessageEmbed()
        .setTitle("Poll")
        .setDescription(text)
        .setFooter("Made by: " + msg.author.tag + ", finish date:", msg.author.displayAvatarURL({ dynamic: true }))
        .setColor("RANDOM")
        .setTimestamp(new Date(Date.now() + time));
      if (msg.member.hasPermission("ADMINISTRATOR")) {
        if (msg.mentions.everyone) {
          if (msg.content.includes("@everyone")) {
            mentions += "@everyone ";
          }
          if (msg.content.includes("@here")) {
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
            if (msg.deletable) msg.delete();
            if (reactions.length) {
              toreact.forEach(function (entry) {
                poll.react(entry).catch(error => {
                  console.log(error);
                });
              });
            } else {
              poll.react(":Perfecto:460279003673001985");
              poll.react(":Perfecto:612137351166033950");
            }
            const newMessage = new MessageModel({
              messageId: poll.id,
              channelId: poll.channel.id,
              date: new Date(Date.now() + time),
              reactions: reactions.length ? reactions : ["460279003673001985", "612137351166033950"]
            })
            newMessage.save().then(() => interval(bot, true)).catch(() => msg.channel.send("Could not save the message and the time in database."));
          },
          error => {
            console.log(error);
            msg.react("❌");
          }
        );
    }
  }
}