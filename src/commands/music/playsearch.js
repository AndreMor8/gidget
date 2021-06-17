import { MessageEmbed } from "discord.js";
export default class extends Command {
  constructor(options) {
    super(options);
    this.aliases = ["ps"];
    this.description = "Browse videos to select which will be to play.";
    this.guildonly = true;
    this.permissions = {
      user: [0n, 0n],
      bot: [0n, 0n]
    };
  }
  async run(bot, message, args) {
    const channel = message.member.voice.channel;
    if (!channel) return message.channel.send("You need to be in a voice channel to play music!");
    const queue = bot.distube.getQueue(message);
    if (queue && queue.voiceChannel.id !== channel.id) return message.channel.send("You are not on the same voice channel as me.");
    if (!args[1]) return message.channel.send("Please enter a search term.");
    if (args.slice(1).join(" ").length > 250) return message.channel.send("The maximum size of the search term is 250 characters.");
    if (/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()!@:%_+.~#?&//=]*)/.test(args[1])) return message.channel.send("YouTube links should go in the `play` command");
    if ((await import("ytdl-core")).default.validateID(args[1]) || (await import("@distube/ytpl")).default.validateID(args[1])) return message.channel.send("YouTube IDs should go in the `play` command");
    try {
      message.channel.startTyping();
      const videos = await bot.distube.search(args.slice(1).join(" "), { safeSearch: !message.channel.nsfw });
      if (!videos.length) return message.channel.send("I didn't find any video. Please try again with another term.");
      let text = '';
      let i = 0;
      for (const elements of videos) {
        if (text.length < 1750) {
          text += `${i + 1}. **${elements.name}**\nDuration: ${elements.formattedDuration}\n\n`
        } else break;
        i++;
      }
      const embed = new MessageEmbed()
        .setTitle(`Search results for ${args.slice(1).join(" ")}`)
        .setDescription(text)
        .setFooter(i + " results, say a number to play that music, you can say \"stop\" to stop selecting")
        .setColor("RANDOM")
        .setAuthor(message.author.tag, message.author.displayAvatarURL({ dynamic: true }))

      const msg = await message.channel.send({ embeds: [embed] });
      msg.channel.stopTyping();
      const collector = message.channel.createMessageCollector(m => m.author.id === message.author.id, { time: 35000, idle: 15000 })

      collector.on("collect", async message => {
        const number = parseInt(message.content);
        if (!isNaN(number)) {
          if (number <= i && number >= 1) {
            if (!msg.deleted) await msg.delete();
            collector.stop("Ok!");
            bot.commands.get("play").run(bot, message, ["play", videos[number - 1].url]);
          } else if (i < number) {
            message.channel.send("There are only " + i + " results...");
          } else {
            message.channel.send("Invalid number...")
          }
        } else if (message.content === "stop") {
          if (!msg.deleted) await msg.delete();
          collector.stop("manual");
        } else {
          message.channel.send("Invalid number!");
        }
      });
      collector.on("end", (collected, reason) => {
        if (reason === "Ok!") return;
        else if (reason === "idle" || reason === "time") {
          if (!msg.deleted) msg.delete()
          message.channel.send("Time's up! Run this command again...");
        } else if (reason === "manual") {
          message.channel.send("Ok, it seems you don't want music");
        } else {
          message.channel.send("Collector ended with reason: " + reason);
        }
      })

    } catch (err) {
      message.channel.stopTyping(true);
      message.channel.send("Some error ocurred. Here's a debug: " + err);
    }
  }
}