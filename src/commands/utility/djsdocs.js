import { MessageEmbed } from "discord.js";
import fetch from 'node-fetch';
export default class extends Command {
  constructor(options) {
    super(options);
    this.aliases = ["djs", "discordjs", "discord.js"];
    this.description = "Discord.js Docs :)";
    this.permissions = {
      user: [0, 0],
      bot: [0, 16384]
    };
  }
  async run(bot, message, args) {
    //https://djsdocs.sorta.moe/v2/embed?src=stable&q=Client
    if (!args[1]) return message.channel.send("What do you want to look for in the Discord.js documentation?");
    let src = "";
    let cont = "";
    if (["stable", "master", "commando", "rpc", "akairo", "akairo-master", "collection"].includes(args[1]?.toLowerCase())) {
      src = args[1];
      cont = args.slice(2).join(" ");
    } else {
      src = "stable";
      cont = args.slice(1).join(" ");
    }
    const page = `https://djsdocs.sorta.moe/v2/embed?src=${encodeURIComponent(src)}&q=${encodeURIComponent(cont)}`;
    const r = await fetch(page);
    if (!r.ok) return message.channel.send(`Error: Status code from ${page} returned ${r.status} (${r.statusText})`)
    const res = await r.json();
    if (!res) return message.channel.send(new MessageEmbed().setTitle("Error").setDescription("No results found"));
    if (res.error) return message.channel.send(new MessageEmbed().setTitle("Error " + res.status).setDescription(res.error + ": " + res.message));
    await message.channel.send(new MessageEmbed(res));
  }
}
