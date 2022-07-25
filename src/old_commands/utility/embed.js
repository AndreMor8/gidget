import { EmbedBuilder, ActionRowBuilder, ButtonBuilder } from "discord.js";
import saybutton from '../../database/models/saybutton.js';
const actual = new Set();

export default class extends Command {
  constructor(options) {
    super(options);
    this.description = "Create a embed";
    this.aliases = ["createembed"];
  }
  async run(bot, message, args) {
    if (actual.has(message.author.id)) return;
    let i = 0;
    let channel;
    if (message.guild) {
      channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[1]) || message.guild.channels.cache.find(c => c.name === args[1]) || await message.guild.channels.fetch(args[1] || "123").catch(() => { }) || message.channel;
      if (channel.guild.id !== message.guild.id) return message.channel.send("That channel is from another guild");
      if (!channel.isTextBased()) return message.channel.send("That isn't a text channel!");
      if (!channel.permissionsFor(bot.user.id).has(["SendMessages", "EmbedLinks"])) return message.channel.send("I don't have permissions!");
      if (!channel.permissionsFor(message.author.id).has(["SendMessages", "EmbedLinks"])) return message.channel.send("You don't have permissions!");
    } else {
      channel = message.channel;
    }
    const linkregex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()!@:%_+.~#?&/\\/=]*)/g;
    const questions = ["To get out of here put **`exit`**\nTo omit something say `none` **(except in the fields)**\n\nGet a preview of your embed with `preview`\n\nTell me the content of the message that will not be in the embed.", "Tell me the embed author", "Tell me a link o upload a attachment for the author image", "Tell me the author link", "Tell me the title", "Tell me the embed link", "Tell me a description", "Tell me a thumbnail link or upload a attachment", "Tell me a image link or upload a attachment", "Tell me a footer text", "Tell me a footer image link or upload a attachment", "Tell me the color to put it on the embed", "Do you want fields?\n\n**Respond with `yes` or `no`**"];
    const authorButton = new ActionRowBuilder().addComponents([new ButtonBuilder()
      .setCustomId("author-button")
      .setDisabled(true)
      .setStyle("Secondary")
      .setLabel(`Sent by ${message.author.tag} @ ${message.author.id}`)]);
    const doc = (await saybutton.findOne({ guildId: { $eq: message.guild.id } }).lean()) || (await saybutton.create({ guildId: message.guild.id }));
    await message.channel.send(questions[0]);
    actual.add(message.author.id);
    let msgContent = "";
    let author = "";
    let authorimg = "";
    let authorlink = "";
    let footer = "";
    const embed = new EmbedBuilder();
    const collector = message.channel.createMessageCollector({ filter: (m) => m.author.id === message.author.id, idle: 120000 });
    collector.on("collect", async (m) => {
      try {
        if (m.content.toLowerCase() === "exit") return collector.stop("Exited");
        if (m.content.toLowerCase() === "preview")
          return message.channel.send({ content: "Here's a preview of your embed", embeds: [embed], components: doc.enabled ? [authorButton] : undefined }).catch(() => message.channel.send("You will need to fill out your embed a bit to be able to send it."))
        switch (i) {
          case 0:
            if (m.content.toLowerCase() === "none") msgContent = undefined
            else msgContent = m.content;

            i++;
            await message.channel.send(questions[i]);
            break;
          case 1:
            if (m.content === "none") {
              i = i + 3;
              await message.channel.send(questions[i]);
            } else {
              author = m.content;
              i++;
              await message.channel.send(questions[i]);
            }
            break;
          case 2:
            if (m.content === "none") {
              authorimg = undefined;
              i++;
              await message.channel.send(questions[i]);
            } else {
              if (!m.attachments.first() && !linkregex.test(m.content))
                return message.channel.send("Invalid URL");
              else if (m.attachments.first()) {
                authorimg = m.attachments.first().url;
                i++;
              } else if (linkregex.test(m.content)) {
                authorimg = m.content;
                i++;
              }
              await message.channel.send(questions[i]);
            }
            break;
          case 3:
            if (m.content === "none") {
              authorlink = undefined;
              i++;
              embed.setAuthor({ name: author, iconURL: authorimg, url: authorlink });
              await message.channel.send(questions[i]);
            } else {
              if (!linkregex.test(m.content))
                return message.channel.send("Invalid URL");
              else {
                authorlink = m.content;
                i++;
              }
              embed.setAuthor({ name: author, iconURL: authorimg, url: authorlink });
              await message.channel.send(questions[i]);
            }
            break;
          case 4:
            if (m.content === "none") i++;
            else {
              embed.setTitle(m.content);
              i++;
            }
            await message.channel.send(questions[i]);
            break;
          case 5:
            if (m.content === "none") i++;
            else if (linkregex.test(m.content)) {
              embed.setURL(m.content);
              i++;
            } else return message.channel.send("Invalid URL");
            await message.channel.send(questions[i]);
            break;
          case 6:
            if (m.content === "none") i++;
            else {
              embed.setDescription(m.content);
              i++;
            }
            await message.channel.send(questions[i]);
            break;
          case 7:
            if (m.content === "none") {
              i++;
              await message.channel.send(questions[i]);
            } else {
              if (!m.attachments.first() && !linkregex.test(m.content))
                return message.channel.send("Invalid URL");
              else if (m.attachments.first()) {
                embed.setThumbnail(m.attachments.first().url);
                i++;
              } else if (linkregex.test(m.content)) {
                embed.setThumbnail(m.content);
                i++;
              }
              await message.channel.send(questions[i]);
            }
            break;
          case 8:
            if (m.content === "none") {
              i++;
              await message.channel.send(questions[i]);
            } else {
              if (!m.attachments.first() && !linkregex.test(m.content))
                return message.channel.send("Invalid URL");
              else if (m.attachments.first()) {
                embed.setImage(m.attachments.first().url);
                i++;
              } else if (linkregex.test(m.content)) {
                embed.setImage(m.content);
                i++;
              }
              await message.channel.send(questions[i]);
            }
            break;
          case 9:
            if (m.content === "none") {
              footer = undefined;
              i = i + 2;
            } else {
              footer = m.content;
              i++;
            }
            await message.channel.send(questions[i]);
            break;
          case 10:
            if (m.content === "none") {
              i++;
              embed.setFooter({ text: footer });
              await message.channel.send(questions[i]);
            } else {
              if (!m.attachments.first() && !linkregex.test(m.content))
                return message.channel.send("Invalid URL");
              else if (m.attachments.first()) {
                embed.setFooter({ text: footer, iconURL: m.attachments.first().url });
                i++;
              } else if (linkregex.test(m.content)) {
                embed.setFooter({ text: footer, iconURL: m.content });
                i++;
              }
              await message.channel.send(questions[i]);
            }
            break;
          case 11:
            if (m.content !== "none") {
              if (/^#([a-fA-F0-9]){3}$|[a-fA-F0-9]{6}$/.test(m.content)) embed.setColor(m.content);
              else return message.channel.send("Invalid color!");
            }
            i++;
            await message.channel.send(questions[i]);
            break;
          case 12:
            if (m.content.toLowerCase() === "yes") {
              collector.stop("field");
            } else if (m.content.toLowerCase() === "no" || m.content.toLowerCase() === "none") {
              collector.stop("Finished");
            } else
              return message.channel.send("Invalid option!");
            break;
        }
      } catch (err) {
        return message.channel.send(`Error: ${err}`);
      }
    });
    collector.on("end", (collected, reason) => {
      if (reason === "field") {
        return fields(message, embed).then(embed => {
          channel.send({ content: msgContent, embeds: [embed], components: doc.enabled ? [authorButton] : undefined }).catch((err) => message.channel.send(`${err}`));
        }).catch(reason => {
          if (reason === "idle") message.channel.send("Your time is over (2 minutes). Run this command again if you want a embed");
          else if (reason === "no") message.channel.send("It seems you don't want an embed.");
          else message.channel.send("Collector ended with reason: " + reason).catch(() => { });
        }).finally(() => {
          actual.delete(message.author.id);
        });
      }
      actual.delete(message.author.id);
      if (reason === "Exited") message.channel.send("It seems you don't want an embed.");
      else if (reason === "Finished") channel.send({ content: msgContent, embeds: [embed], components: doc.enabled ? [authorButton] : undefined }).catch((err) => message.channel.send(`${err}`));
      else if (reason === "idle") message.channel.send("Your time is over (2 minutes). Run this command again if you want a embed");
      else message.channel.send("Collector ended with reason: " + reason).catch(() => { });
    });
  }
}
function fields(message, embed) {
  return new Promise((resolve, reject) => {
    const o = 1;
    let i = 0;
    let title = "";
    let des = "";
    message.channel.send("To get out of here put **`exit`**\n\nYou can't skip this with `none`...");
    const arr = ["Tell me the field name", "Tell me the field value", "Want this to be a inline field?\n\n**Respond with `yes` or `no`**", "Want another field?\n\n**Respond with `yes` or `no`**"];
    message.channel.send(arr[i]);
    const collector = message.channel.createMessageCollector({ filter: (m) => m.author.id === message.author.id, idle: 120000 });
    collector.on("collect", m => {
      try {
        if (m.content.toLowerCase() === "exit") {
          return collector.stop("no");
        }
        if (!m.content) {
          return message.channel.send("Don't be crazy, put something on, okay?");
        }
        switch (i) {
          case 0:
            title = m.content
            i++;
            message.channel.send(arr[i]);
            break;
          case 1:
            des = m.content
            i++;
            message.channel.send(arr[i]);
            break;
          case 2:
            if (m.content.toLowerCase() === "yes") {
              embed.addFields([{ name: title, value: des, inline: true }]);
              i++;
            } else if (m.content.toLowerCase() === "no") {
              embed.addFields([{ name: title, value: des }]);
              i++;
            } else return message.channel.send("Invalid option!");
            if (o <= 25) message.channel.send(arr[i]);
            else collector.stop("OK");
            break;
          case 3:
            if (m.content.toLowerCase() === "yes") {
              title = undefined
              des = undefined
              i = 0;
              message.channel.send(arr[i]);
            } else if (m.content.toLowerCase() === "no") {
              collector.stop("OK");
            } else return message.channel.send("Invalid option!");
            break;
        }
      } catch (err) {
        return message.channel.send(`Error: ${err}`)
      }
    })
    collector.on("end", (collected, reason) => {
      if (reason === "OK") resolve(embed);
      else reject(reason);
    })
  })
}