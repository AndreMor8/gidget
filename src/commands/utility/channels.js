const { Util } = require("discord.js");
module.exports = {
  run: async (bot, message, args) => {
    if(!message.guild) return message.channel.send("The only channel I can see here is this.")
    let text = "";
    let member =
      message.mentions.members.first() ||
      message.guild.members.cache.get(args[1]) ||
      message.guild.members.cache.find(m => m.nickname === args.slice(1).join(" ")) ||
      message.guild.members.cache.find(m => m.user ? (m.user.tag === args.slice(1).join(" ")) : false) ||
      message.guild.members.cache.find(m => m.user ? (m.user.tag === args.slice(1).join(" ")) : false) || (args[1] ? await message.guild.members.fetch(args[1]).catch(err => {}) : undefined)
    let col;
    if(member) {
      col = message.guild.channels.cache.filter(c => c.type === "category" ? (c.children.some(r => r.permissionsFor(member).has("VIEW_CHANNEL")) || (c.permissionsFor(member).has("MANAGE_CHANNELS"))) : (c.permissionsFor(member).has("VIEW_CHANNEL")));
    } else {
      if(args[1]) member = await message.guild.members.fetch(args[1]).catch(err => {});
      if(member) col = message.guild.channels.cache.filter(c => c.type === "category" ? (c.children.some(r => r.permissionsFor(member).has("VIEW_CHANNEL")) || (c.permissionsFor(member).has("MANAGE_CHANNELS"))) : (c.permissionsFor(member).has("VIEW_CHANNEL")));
      else col = message.guild.channels.cache;
    }
    const wocat = Util.discordSort(col.filter(c => !c.parent && c.type !== "category"))
    const textnp = wocat.filter(c => ['text', 'store', 'news'].includes(c.type));
    const voicenp = wocat.filter(c => c.type === "voice");
    if(wocat.size >= 1) {
      text += textnp.map(advancedmap).join("\n");
      text += voicenp.map(advancedmap).join("\n");
    };
    let cats = Util.discordSort(col.filter(c => c.type === "category"));
    cats.each(c => {
      const children = c.children.intersect(col);
      const textp = children.filter(c => ['text', 'store', 'news'].includes(c.type));
      const voicep = children.filter(c => c.type === "voice");
      text += "\n[📂] " + c.name;
      text += textp.size ? ("\n\t" + Util.discordSort(textp).map(advancedmap).join("\n\t")) : ""
      text += voicep.size ? ("\n\t" + Util.discordSort(voicep).map(advancedmap).join("\n\t")) : ""
    })
    const split = Util.splitMessage(text)
    for (let i in split) {
      await message.channel.send("\nChannel structure of " + message.guild.name + (member ? (" for " + member.user.tag) : ""), { code: split[i] })
    }
  },
  aliases: [],
  description: "Channel structure for a server....",
}

function advancedmap(c) {
        let r = "";
        switch(c.type) {
          case "news":
          case "text":
            r += "[📃] " + c.name;
            break;
          case "voice":
            r += "[🎙] " + c.name + (c.members.size ? (c.members.map(d => {
              if(d.user.bot) {
                return "\n\t\t[🤖] " + d.user.tag;
              } else {
                return "\n\t\t[🙎] " + d.user.tag;
              }
            })).join("") : "")
            break;
          case "store":
            r += "[🏪] " + c.name;
            break;
          default:
            r += "[?] " + c.name;
            break;
        }
        return r;
}