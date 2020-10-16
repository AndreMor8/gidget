import Command from '../../utils/command.js';
import Discord from "discord.js";
import { checkSingleCleanURL } from '../../utils/clean-url/index.js';
const timer = new Set();
import check from '../../utils/nsfw.js';

export default class extends Command {
  constructor(options) {
    super(options);
    this.aliases = ["ss", "pageshot", "screenwebpage", "web"],
      this.description = "Screenshot of a page",
      this.permissions = {
        user: [0, 0],
        bot: [0, 32768]
      }
  }
  async run(bot, message, args) {
    if(!global.browser) return message.channel.send("Puppeteer not enabled in this bot instance");
    if (!args[1]) return message.channel.send("Put some URL");
    if (message.author.id !== "577000793094488085") {
      if (!timer.has(message.author.id)) {
        timer.add(message.author.id)
        setTimeout(() => {
          timer.delete(message.author.id);
        }, 25000); //Hm
      } else {
        return message.channel.send("Don't overload this command! (25 sec cooldown)");
      }
    }
    if (args[3]) {
      let options = {
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
      let options = {
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

async function pup(message, url, options) {
  const result = await checkSingleCleanURL(url);
  if (result && !message.channel.nsfw) return message.channel.send("To view inappropriate pages use a NSFW channel");
  var form = await message.channel.send("Hang on! <:WaldenRead:665434370022178837>").catch(err => { });
  message.channel.startTyping().catch(err => { });
  let page;
  try {
    setTimeout(() => {
      message.channel.stopTyping(true);
    }, 40000);
    page = await global.browser.newPage();
    page.on("error", async error => {
      message.channel.stopTyping(true);
      await message.channel.send(`There was an error opening a page. Here's a debug: ${error}`).catch(err => { });;
      await form.delete().catch(err => { });;
    });
    if (!page) return;
    await page.goto(url, { waitUntil: "networkidle2" });
    let screenshot;
    if (options && !isNaN(options.x) && !isNaN(options.y)) {
      screenshot = await page.screenshot({
        clip: { x: options.x, y: options.y, width: 1440, height: 900 }
      });
    } else {
      screenshot = await page.screenshot({ type: "png" });
    }
    const isNSFW = await check(screenshot);
    if (isNSFW && !message.channel.nsfw) {
      message.channel.stopTyping(true);
      return message.channel.send("NSFW content has been detected in the generated image. If you want to see it, ask for it on a NSFW channel.")
    };
    const attachment = new Discord.MessageAttachment(screenshot, "file.png");
    message.channel.stopTyping(true);
    await message.channel.send("Time: " + (Date.now() - (form.editedTimestamp || form.createdTimestamp)) / 1000 + "s", attachment)
    await form.delete();
  } catch (error) {
    message.channel.stopTyping(true);
    await message.channel.send(`Some error ocurred. Here's a debug: ${error}`).catch(err => { });
    await form.delete().catch(err => { });
  } finally {
    try {
      if (page && page.close && page.close instanceof Function) {
        await page.close();
      }
    } catch (error) {
      console.log(error);
    }
  }
}
