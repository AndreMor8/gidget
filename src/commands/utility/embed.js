const { MessageEmbed } = require("discord.js");
module.exports = {
  run: async (bot, message, args) => {
    let i = 0;
    let channel;
    if(message.guild) {
      channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[1]) || message.guild.channels.cache.find(c => c.name === args[1]) || message.channel;
      if (channel.guild.id !== message.guild.id) return message.channel.send("That channel is from another guild");
      if(!["text", "news"].includes(channel.type)) return message.channel.send("That isn't a text channel!");
      if(!channel.permissionsFor(bot.user).has(["SEND_MESSAGES", "EMBED_LINKS"])) return message.channel.send("I don't have permissions!");
      if (!channel.permissionsFor(message.author).has(["SEND_MESSAGES", "EMBED_LINKS"])) return message.channel.send("You don't have permissions!");
    } else {
      channel = message.channel;
    }
    const linkregex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()!@:%_\+.~#?&\/\/=]*)/g
    let questions = ["To get out of here put `exit`\nTo omit something say `none` (except in the fields)\n\nTell me the content of the message that will not be in the embed.", "Tell me the embed author", "Tell me a link o upload a attachment for the author image", "Tell me the author link", "Tell me the title", "Tell me the embed link", "Tell me a description", "Tell me a thumbnail link or upload a attachment", "Tell me a image link or upload a attachment", "Tell me a footer text", "Tell me a footer image link or upload a attachment", "Tell me the color to put it on the embed", "Do you want fields?"];
    await message.channel.send(questions[0]);
    let msgContent = "";
    let author = "";
    let authorimg = "";
    let authorlink = "";
    let footer = "";
    const embed = new MessageEmbed();
    let collector = message.channel.createMessageCollector((m) => m.author.id === message.author.id, { idle: 120000 })
    collector.on("collect", async m => {
      if(m.content === "exit") return collector.stop("Exited");
      switch(i) {
        case 0:
          if(m.content === "none") {
            msgContent = undefined
          } else {
            msgContent = m.content;
          }
          i++
          await message.channel.send(questions[i]);
          break;
          case 1:
          if(m.content === "none") {
            i = i + 3;
            await message.channel.send(questions[i]);
          } else {
            author = m.content
            i++;
            await message.channel.send(questions[i]);
          }
          break;
          case 2:
          if(m.content === "none") {
            authorimg = undefined;
            i++
            await message.channel.send(questions[i]);
          } else {
            if(!m.attachments.first() && !linkregex.test(m.content)) return message.channel.send("Invalid URL");
            else if (m.attachments.first()) {
              authorimg = m.attachments.first().url;
              i++
            } else if (linkregex.test(m.content)) {
              authorimg = m.content;
              i++;
            }
            await message.channel.send(questions[i]);
          }
          break;
          case 3:
          if(m.content === "none") {
            authorlink = undefined;
            i++
            embed.setAuthor(author, authorimg, authorlink);
            await message.channel.send(questions[i]);
          } else {
            if(!linkregex.test(m.content)) return message.channel.send("Invalid URL");
            else {
              authorlink = m.content; 
              i++
            }
            embed.setAuthor(author, authorimg, authorlink);
            await message.channel.send(questions[i]);
          }
          break;
          case 4:
          if(m.content === "none") {
            i++
          } else {
            embed.setTitle(m.content);
            i++
          }
          await message.channel.send(questions[i]);
          break;
          case 5:
          if(m.content === "none") {
            i++
          } else if (linkregex.test(m.content)){
            embed.setURL(m.content);
            i++
          } else return message.channel.send("Invalid URL");
          await message.channel.send(questions[i]);
          break;
          case 6:
          if(m.content === "none") {
            i++
          } else {
            embed.setDescription(m.content);
            i++
          }
          await message.channel.send(questions[i]);
          break;
          case 7:
          if(m.content === "none") {
            i++
            await message.channel.send(questions[i]);
          } else {
            if(!m.attachments.first() && !linkregex.test(m.content)) return message.channel.send("Invalid URL");
            else if (m.attachments.first()) {
              embed.setThumbnail(m.attachments.first().url);
              i++
            } else if (linkregex.test(m.content)) {
               embed.setThumbnail(m.content);
              i++;
            }
            await message.channel.send(questions[i]);
          }
          break;
          case 8:
          if(m.content === "none") {
            i++
            await message.channel.send(questions[i]);
          } else {
            if(!m.attachments.first() && !linkregex.test(m.content)) return message.channel.send("Invalid URL");
            else if (m.attachments.first()) {
              embed.setImage(m.attachments.first().url);
              i++
            } else if (linkregex.test(m.content)) {
               embed.setImage(m.content);
              i++;
            }
            await message.channel.send(questions[i]);
          }
          break;
          case 9:
          if(m.content === "none") {
            footer = undefined
            i = i + 2;
          } else {
            footer = m.content;
            i++
          }
          await message.channel.send(questions[i]);
          break;
          case 10:
          if(m.content === "none") {
            i++
            embed.setFooter(footer)
            await message.channel.send(questions[i]);
          } else {
            if(!m.attachments.first() && !linkregex.test(m.content)) return message.channel.send("Invalid URL");
            else if (m.attachments.first()) {
              embed.setFooter(footer, m.attachments.first().url)
              i++
            } else if (linkregex.test(m.content)) {
               embed.setFooter(footer, m.content)
              i++;
            }
            await message.channel.send(questions[i]);
          }
          break;
        case 11:
          if(m.content !== "none") embed.setColor(m.content);
          i++
          await message.channel.send(questions[i]);
          break;
          case 12:
          if(m.content.toLowerCase() === "yes") {
            collector.stop("field")
          } else if (m.content.toLowerCase() === "no") {
            collector.stop("Finished");
          } else return message.channel.send("Invalid option!");
          break;
      }
    })
    collector.on("end", async (collected, reason) => {
      if (reason === "Exited") {
        message.channel.send("It seems you don't want an embed.");
      } else if(reason === "field") {
        fields(message, embed).then(embed => {
          channel.send(msgContent, embed);
        }).catch(reason => {
          if (reason === "idle") {
        message.channel.send("Your time is over (2 minutes). Run this command again if you want a embed");
      } else {
        message.channel.send("Collector ended with reason: " + reason).catch(err => {});
      }
        });
      }
      else if(reason === "Finished") {
        channel.send(msgContent, embed);
      } else if (reason === "idle") {
        message.channel.send("Your time is over (2 minutes). Run this command again if you want a embed");
      } else {
        message.channel.send("Collector ended with reason: " + reason).catch(err => {});
      }
    })
  },
  description: "Create a embed",
  aliases: [],
  permissions: {
    user: [0, 0],
    bot: [0, 0]
  }
}

function fields(message, embed) {
  return new Promise((resolve, reject) => {
    let o = 1;
    let i = 0;
    let title = "";
    let des = "";
    let arr = ["Tell me the field name", "Tell me the field value", "Want this to be a inline field?", "Want another field?"];
    message.channel.send(arr[i]);
    let collector = message.channel.createMessageCollector((m) => m.author.id === message.author.id, { idle: 120000 });
    collector.on("collect", m => {
      switch(i) {
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
          if(m.content.toLowerCase() === "yes") {
            embed.addField(title, des, true)
            i++;
          } else if (m.content.toLowerCase() === "no") {
            embed.addField(title, des)
            i++;
          } else return message.channel.send("Invalid option!");
          if (o <= 25) message.channel.send(arr[i]);
          else collector.stop("OK");
          break;
        case 3:
          if(m.content.toLowerCase() === "yes") {
            title = undefined
            des = undefined
            i = 0;
            message.channel.send(arr[i]);
          } else if (m.content.toLowerCase() === "no") {
            collector.stop("OK");
          } else return message.channel.send("Invalid option!");
          break;
      }
    })
    collector.on("end", (collected, reason) => {
      if(reason === "OK") {
        resolve(embed);
      } else {
        reject(reason);
      }
    })
  })
}