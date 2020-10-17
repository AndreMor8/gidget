import ytsr from "ytsr";
import ytpl from "ytpl";
import ytdl from "discord-ytdl-core";
import { MessageEmbed } from "discord.js";
import Command from "../../utils/command.js";
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
    if (!args[1]) return message.channel.send("Put a search term")
    if (/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()!@:%_\+.~#?&\/\/=]*)/.test(args[1])) return message.channel.send("YouTube links should go in the `play` command");
    if (ytdl.validateID(args[1]) || ytpl.validateID(args[1])) return message.channel.send("YouTube IDs should go in the `play` command");
    let filter;
    try {
      message.channel.startTyping();
      const filters = await ytsr.getFilters(args.slice(1).join(" "));
      filter = filters.get("Type").find(o => o.name === "Video");
      let options = {
        safeSearch: true,
        limit: 10,
        nextpageRef: filter.ref
      };
      const searchResults = await ytsr(null, options);
      if (!searchResults) {
        message.channel.stopTyping(true);
        return message.reply(`I didn't find any video. Check your term and try again.`);
      }
      if (!searchResults.items[0]) {
        message.channel.stopTyping(true);
        return message.reply(`I didn't find any video. Check your term and try again.`);
      }
      let text = '';
      let i = 0;
      for (const elements of Object.values(searchResults.items)) {
        i++
        if (text.length < 1600) {
          text += `${i}. **${elements.title}**\nChannel: ${elements.author.name} ${elements.author.verified ? "(Verified)" : ""}\n${elements.views} views, uploaded ${elements.uploaded_at}\nDuration: ${elements.duration}\n\n`
        } else break;
      }

      const embed = new MessageEmbed()
        .setTitle("Search results for " + searchResults.query)
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
            global.botCommands.get("play").run(bot, message, ["play", searchResults.items[number - 1].link]);
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