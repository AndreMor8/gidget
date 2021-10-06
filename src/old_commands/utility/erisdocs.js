import { MessageEmbed } from "discord.js";
import fetch from 'node-fetch';
export default class extends Command {
  constructor(options) {
    super(options);
    this.aliases = ["eris", "eris-docs"];
    this.description = "Eris Docs :)";
    this.permissions = {
      user: [0n, 0n],
      bot: [0n, 16384n]
    };
  }
  async run(bot, message, args) {
    if (!args[1]) return message.channel.send("What do you want to look for in the Eris documentation?");
    const page = `https://eris-docs-api.herokuapp.com/?query=${encodeURIComponent(args.slice(1).join(" "))}`;
    await fetch(page).then(async r => {
      const res = await r.json();
      await message.channel.send({ content: res.content, embeds: [new MessageEmbed(res.embed)] });
    }).catch((err) => {
      return message.channel.send(`An error occurred while consulting the documentation: ${err.message}`)
    });
  }
}
