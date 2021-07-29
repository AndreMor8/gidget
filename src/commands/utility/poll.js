//Needs update for infinite polls
import Discord from "discord.js";
import ms from "ms";
import pollDb from "../../database/models/poll.js";
import interval from "../../utils/poll.js";

export default class extends Command {
  constructor(options) {
    super(options);
    this.description = "Reaction poll system";
    this.guildonly = true;
    this.permissions = {
      user: [0n, 0n],
      bot: [0n, 286784n]
    };
  }
  // eslint-disable-next-line require-await
  async run(bot, message, args) {
    if (!args[1]) return message.channel.send("Usage: `poll <time> [<emoji1> <emoji2> <emoji(n)>] <text/attachment>`\nExample: `poll 10m 😆 ✅ 🌊 hello`");
    const time = ms(args[1]);
    if (typeof time !== "number" || time < 40000) return message.channel.send("Invalid time! Must be 40 seconds or more.");
    return cmd_umfrage(message, args.slice(2));

    function cmd_umfrage(msg, args) {
      let imgs = [];
      if (msg.guild.me.permissions.has("ATTACH_FILES")) imgs = msg.attachments.map((img) => { return { attachment: img.url, name: img.name } });
      if (args.length || imgs.length) {
        const text = args.join(" ").split("\n");
        args = text.shift().split(" ");
        if (text.length) args.push("\n" + text.join("\n"));
        const reactions = [];
        const custom = /^<a?:/;
        // eslint-disable-next-line no-control-regex
        const pattern = /^[\u0000-\u1FFF]{1,4}$/;
        for (let i = 0; i < args.length || imgs.length; i++) {
          let reaction = args[i] || "1";
          if (!custom.test(reaction) && (reaction.length > 4 || pattern.test(reaction))) {
            cmd_sendumfrage(msg, args.slice(i).join(" ").replace(/^\n| (\n)/, "$1"), reactions, imgs);
            break;
          } else if (reaction !== '') {
            if (custom.test(reaction)) reaction = reaction.substring(reaction.indexOf(":") + 1, reaction.length - 1);
            reactions.push(reaction);
            if (i === args.length - 1) {
              cmd_sendumfrage(msg, args.slice(i + 1).join(" ").replace(/^\n| (\n)/, "$1"), reactions, imgs);
              break;
            }
          }
        }
      } else {
        msg.channel.send("Usage: `poll <time> [<emoji1> <emoji2> <emoji(n)>] <text/attachment>`");
      }
    }

    async function cmd_sendumfrage(msg, text, reactions, imgs) {
      let mentions = "";
      const embed = new Discord.MessageEmbed()
        .setTitle("Poll")
        .setDescription(text)
        .setFooter("Made by: " + msg.author.tag + ", finish date:", msg.author.displayAvatarURL({ dynamic: true }))
        .setColor("RANDOM")
        .setTimestamp(new Date(Date.now() + time));
      if (imgs[0] && ['.png', '.gif', '.jpg', '.jpeg'].some(e => imgs[0].name.endsWith(e))) {
        embed.setImage(`attachment://${imgs[0].name}`);
      }
      if (msg.channel.permissionsFor(msg.author.id).has("MENTION_EVERYONE") && msg.channel.permissionsFor(bot.user.id).has("MENTION_EVERYONE")) {
        if (msg.mentions.everyone) {
          if (msg.content.includes("@everyone")) mentions += "@everyone ";
          if (msg.content.includes("@here")) mentions += "@here ";
        }
        mentions += msg.mentions.roles.map(r => r.toString()).join(" ");
      }
      const poll = await msg.channel.send({
        content: mentions || undefined,
        embeds: [embed],
        allowedMentions: { parse: (msg.channel.permissionsFor(msg.author.id).has("MENTION_EVERYONE") ? ["users", "everyone", "roles"] : []) },
        files: imgs
      })
      try {
        if (msg.deletable) msg.delete();
        if (reactions.length) {
          for (const reaction of reactions) {
            await poll.react(reaction);
          }
        } else {
          await poll.react("Perfecto:460279003673001985");
          await poll.react("WaldenNo:612137351166033950");
        }
        await Discord.Util.delayFor(1000);
        await pollDb.create({
          messageId: poll.id,
          channelId: poll.channel.id,
          date: new Date(Date.now() + time),
          reactions: poll.reactions.cache.map(e => e.emoji.identifier)
        }).then(() => interval(bot, true));
      } catch (err) {
        await message.channel.send(`Error when creating timed poll: ${err}`);
        await msg.react("❌");
      }
    }
  }
}