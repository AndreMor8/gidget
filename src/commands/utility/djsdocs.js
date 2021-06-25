import { MessageEmbed } from "discord.js";
import fetch from 'node-fetch';
export default class extends Command {
  constructor(options) {
    super(options);
    this.aliases = ["djs", "discordjs", "discord.js"];
    this.description = "Discord.js Docs :)";
    this.permissions = {
      user: [0n, 0n],
      bot: [0n, 16384n]
    };
  }
  async run(bot, message, args) {
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
    await fetch(page).then(async r => {
      const res = await r.json();
      if (res.error) return message.channel.send({ embeds: [new MessageEmbed().setTitle("Error " + res.status).setDescription(res.error + ": " + res.message)] });
      await message.channel.send({ embeds: [new MessageEmbed(res)] });
    }).catch((err) => {
      return message.channel.send(`An error occurred while consulting the documentation: ${err.message}`)
    });
  }
}
