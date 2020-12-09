import yts from 'yt-search';
import { validateID } from '../../utils/playlistID.js';
import ytdl from "ytdl-core";
import { MessageEmbed } from "discord.js";
export default class extends Command {
  constructor(options) {
    super(options);
    this.aliases = ["ps"];
    this.description = "Browse videos to select which will be to play.";
    this.guildonly = true;
    this.permissions = {
      user: [0, 0],
      bot: [0, 0]
    };
  }
  async run(bot, message, args) {
    const serverQueue = message.guild.queue;
    const musicVariables = message.guild.musicVariables;
    if (!message.member.voice.channel) return message.channel.send("You must be on a voice channel.");
    if (serverQueue && serverQueue.voiceChannel.id !== message.member.voice.channel.id) return message.channel.send("I'm on another voice channel! I cannot be on two channels at the same time.");
    if (musicVariables && musicVariables.other) return message.channel.send("I'm doing another operation");
    if (!args[1]) return message.channel.send("Put a search term");
    if (args.slice(1).join(" ").length > 250) return message.channel.send("The maximum size of the search term is 250 characters.");
    if (/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()!@:%_+.~#?&//=]*)/.test(args[1])) return message.channel.send("YouTube links should go in the `play` command");
    if (ytdl.validateID(args[1]) || validateID(args[1])) return message.channel.send("YouTube IDs should go in the `play` command");
    try {
      message.channel.startTyping();
      const res = await yts({ query: args.slice(1).join(" ") });
      if (!res) return message.channel.send("I didn't find any video. Please try again with another term.");
      const { videos } = res;
      if (!videos[0]) return message.channel.send("I didn't find any video. Please try again with another term.");
      let text = '';
      let i = 0;
      for (const elements of videos) {
        if (text.length < 1750) {
          text += `${i + 1}. **${elements.title}**\nUploaded ${elements.ago}\nDuration: ${elements.timestamp}\n\n`
        } else break;
        i++;
      }
      const embed = new MessageEmbed()
        .setTitle(`Search results for ${args.slice(1).join(" ")}`)
        .setDescription(text)
        .setFooter(i + " results, say a number to play that music, you can say \"stop\" to stop selecting")
        .setColor("RANDOM")
        .setAuthor(message.author.tag, message.author.displayAvatarURL({ dynamic: true }))

      const msg = await message.channel.send(embed);
      msg.channel.stopTyping();
      const collector = message.channel.createMessageCollector(m => m.author.id === message.author.id, { time: 35000, idle: 15000 })

      collector.on("collect", async message => {
        let number = parseInt(message.content);
        if (!isNaN(number)) {
          if (number <= i && number >= 1) {
            if (!msg.deleted) await msg.delete();
            collector.stop("Ok!");
            global.botCommands.get("play").run(bot, message, ["play", videos[number - 1].url]);
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