const { MessageEmbed } = require("discord.js");
const fetch = require('node-fetch');
module.exports = {
  run: async (bot, message, args) => {
    //https://djsdocs.sorta.moe/v2/embed?src=stable&q=Client
    let src = "";
    let cont = ""
    if(["stable", "master", "commando", "rpc", "akairo", "akairo-master", "collection"].includes(args[1])) {
      src = args[1];
      cont = args.slice(2).join(" ");
    } else {
      src = "stable"
      cont = args.slice(1).join(" ");
    }
    fetch(`https://djsdocs.sorta.moe/v2/embed?src=${src}&q=${cont}`)
      .then(r => r.json())
      .then(res => {
        if (!res) return message.channel.send(new MessageEmbed().setTitle("Error").setDescription("No results found"))
        if(res.error) return message.channel.send(new MessageEmbed().setTitle("Error " + res.status).setDescription(res.error + ": " + res.message))
      message.channel.send(new MessageEmbed(res));
    }).catch(err => message.channel.send("Error: " + err));
  },
  aliases: ["djs", "discordjs", "discord.js"],
  description: "Discord.js Docs :)"
}