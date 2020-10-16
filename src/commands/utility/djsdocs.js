import Command from '../../utils/command.js'
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
    let src = "";
    let cont = "";
    if (["stable", "master", "commando", "rpc", "akairo", "akairo-master", "collection"].includes(args[1])) {
      src = args[1];
      cont = args.slice(2).join(" ");
    } else {
      src = "stable";
      cont = args.slice(1).join(" ");
    }
    const r = await fetch(`https://djsdocs.sorta.moe/v2/embed?src=${encodeURIComponent(src)}&q=${encodeURIComponent(cont)}`)
    const res = await r.json();
    if (!res) return message.channel.send(new MessageEmbed().setTitle("Error").setDescription("No results found"));
    if (res.error) return message.channel.send(new MessageEmbed().setTitle("Error " + res.status).setDescription(res.error + ": " + res.message));
    await message.channel.send(new MessageEmbed(res));
  }
}