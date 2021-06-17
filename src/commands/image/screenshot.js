import { MessageAttachment } from "discord.js";
import fetch from 'node-fetch';
const timer = new Set();

export default class extends Command {
  constructor(options) {
    super(options);
    this.aliases = ["ss", "pageshot", "screenwebpage", "web"],
      this.description = "Screenshot of a page",
      this.permissions = {
        user: [0n, 0n],
        bot: [0n, 32768n]
      }
  }
  async run(bot, message, args) {
    if (!args[1]) return message.channel.send("Put some URL");
    if (message.author.id !== "577000793094488085") {
      if (!timer.has(message.author.id)) {
        timer.add(message.author.id);
        setTimeout(() => {
          timer.delete(message.author.id);
        }, 25000); //Hm
      } else {
        return message.channel.send("Don't overload this command! (25 sec cooldown)");
      }
    }
    if (args[3]) {
      const options = {
        y: parseInt(args[2]),
        x: parseInt(args[3])
      };
      await pup(
        message,
        args[1].startsWith("http://") || args[1].startsWith("https://")
          ? args[1]
          : `http://${args[1]}`,
        options
      );
    } else if (args[2]) {
      const options = {
        y: parseInt(args[2]),
        x: 0
      };
      await pup(
        message,
        args[1].startsWith("http://") || args[1].startsWith("https://")
          ? args[1]
          : `http://${args[1]}`,
        options
      );
    } else {
      await pup(
        message,
        args[1].startsWith("http://") || args[1].startsWith("https://")
          ? args[1]
          : `http://${args[1]}`,
        undefined
      );
    }
  }
}

/**
 * @param message {Discord.Message}
 * @param url {string}
 * @param options {object}
 */
async function pup(message, url, options) {
  const form = message.channel.send("Hang on! <:WaldenRead:665434370022178837>");
  message.channel.startTyping();
  try {
    const res = await fetch(process.env.PUPPETEER_API, {
      method: "POST",
      headers: {
        "auth-token": process.env.PUPPETEER_TOKEN,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        url, x: options?.x, y: options?.y, nsfw: message.channel.nsfw
      })
    });
    if (!res.ok) return message.channel.send(await res.text() || (res.status + " " + res.statusText));
    else {
      const att = new MessageAttachment(await res.buffer(), "capture.png");
      const time = "Time: " + (Date.now() - (message.editedTimestamp || message.createdTimestamp)) / 1000 + "s";
      await message.channel.send({ content: time, files: [att] });
    }
  } catch (err) {
    message.channel.send("Error: " + err.toString());
  } finally {
    (await form).delete();
    message.channel.stopTyping(true);
  }
}
