import Command from '../../utils/command.js';
import Discord from "discord.js";
import { wiki } from "../../utils/wikilogin.js";
export default class extends Command {
  constructor(options) {
    super(options);
    this.aliases = [];
    this.onlyguild = true;
    this.description = "Test for wiki commands";
    this.permissions = {
      user: [0, 0],
      bot: [0, 16384]
    };
  }
  async run(bot, message, args) {
    if (!args[1])
      return message.channel.send("Usage: fetchdiffs <page>");
    wiki.getArticleRevisionsAsync(args.slice(1).join(" ")).then(async (content) => {
      let i = content.length - 1;
      let max = content.length - 1;
      const embed = new Discord.MessageEmbed()
        .setTitle("Diffs")
        .setFooter("Page: " + args.slice(1).join(" "))
        .setColor("YELLOW")
        .addField("Revision ID", content[i].revid, true)
        .addField("Parent rev ID", content[i].parentid, true)
        .addField("User", "https://wubbzy.fandom.com/wiki/User:" + content[i].user.replace(" ", "_"), true)
        .addField("New size", content[i].size, true)
        .addField("Coment", content[i].comment ? content[i].comment : "None", true)
        .addField("Link", "https://wubbzy.fandom.com/Special:Diff/" + content[i].revid)
        .setTimestamp(content[i].timestamp);
      const msg = await message.channel.send(embed);
      await msg.react("⏮️");
      await msg.react("⏪");
      await msg.react("⏩");
      await msg.react("⏭️");
      await msg.react("⏹️");
      let collector = msg.createReactionCollector((r, user) => ["⏮️", "⏪", "⏩", "⏭️", "⏹️"].includes(r.emoji.name) && user.id === message.author.id, { idle: 20000 });
      collector.on("collect", (r, user) => {
        r.users.remove(user.id);
        switch (r.emoji.name) {
          case "⏮️":
            if (i === max)
              return;
            i = max;
            embed.spliceFields(0, 6)
              .addField("Revision ID", content[i].revid, true)
              .addField("Parent rev ID", content[i].parentid, true)
              .addField("User", "https://wubbzy.fandom.com/wiki/User:" + content[i].user.replace(" ", "_"), true)
              .addField("New size", content[i].size, true)
              .addField("Coment", content[i].comment ? content[i].comment : "None", true)
              .addField("Link", "https://wubbzy.fandom.com/Special:Diff/" + content[i].revid)
              .setTimestamp(content[i].timestamp);
            msg.edit(embed);
            break;
          case "⏪":
            if (i === max)
              return;
            i++;
            embed.spliceFields(0, 6)
              .addField("Revision ID", content[i].revid, true)
              .addField("Parent rev ID", content[i].parentid, true)
              .addField("User", "https://wubbzy.fandom.com/wiki/User:" + content[i].user.replace(" ", "_"), true)
              .addField("New size", content[i].size, true)
              .addField("Coment", content[i].comment ? content[i].comment : "None", true)
              .addField("Link", "https://wubbzy.fandom.com/Special:Diff/" + content[i].revid)
              .setTimestamp(content[i].timestamp);
            msg.edit(embed);
            break;
          case "⏩":
            if (i === 0)
              return;
            i--;
            embed.spliceFields(0, 6)
              .addField("Revision ID", content[i].revid, true)
              .addField("Parent rev ID", content[i].parentid, true)
              .addField("User", "https://wubbzy.fandom.com/wiki/User:" + content[i].user.replace(" ", "_"), true)
              .addField("New size", content[i].size, true)
              .addField("Coment", content[i].comment ? content[i].comment : "None", true)
              .addField("Link", "https://wubbzy.fandom.com/Special:Diff/" + content[i].revid)
              .setTimestamp(content[i].timestamp);
            msg.edit(embed);
            break;
          case "⏭️":
            if (i === 0)
              return;
            i = 0;
            embed.spliceFields(0, 6)
              .addField("Revision ID", content[i].revid, true)
              .addField("Parent rev ID", content[i].parentid, true)
              .addField("User", "https://wubbzy.fandom.com/wiki/User:" + content[i].user.replace(" ", "_"), true)
              .addField("New size", content[i].size, true)
              .addField("Coment", content[i].comment ? content[i].comment : "None", true)
              .addField("Link", "https://wubbzy.fandom.com/Special:Diff/" + content[i].revid)
              .setTimestamp(content[i].timestamp);
            msg.edit(embed);
            break;
          case "⏹️":
            collector.stop();
            break;
        }
      });
      collector.on("end", collected => msg.reactions.removeAll());
    }).catch(err => message.channel.send("Error: " + err));
  }
}
