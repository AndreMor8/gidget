import { Util, Collection, Formatters } from "discord.js";
export default class extends Command {
  constructor(options) {
    super(options)
    this.description = "Channel structure for a server...";
  }
  async run(bot, message, args) {
    if (!message.guild)
      return message.channel.send("The only channel I can see here is this.");
    let text = "";
    const eeee = message.mentions.members.first() ||
      message.guild.members.cache.get(args[1]) ||
      message.guild.members.cache.find(m => m.nickname === args.slice(1).join(" ")) ||
      message.guild.members.cache.find(m => m.user ? (m.user.tag === args.slice(1).join(" ")) : false) ||
      message.guild.members.cache.find(m => m.user ? (m.user.tag === args.slice(1).join(" ")) : false) ||
      (args[1] ? await message.guild.members.fetch(args[1], { cache: true }).catch(() => { }) : undefined) ||
      message.mentions.roles.first() ||
      message.guild.roles.cache.get(args[1]) ||
      message.guild.roles.cache.find(e => e.name === args.slice(1).join(" "));
    const member = (eeee?.members) ? eeee : await eeee?.fetch?.({ cache: true });
    const allChannels = await message.guild.channels.fetch();
    let col = allChannels;
    if (member) {
      col = allChannels.filter(c => c.type === "GUILD_CATEGORY" ? (c.children.some(r => r.permissionsFor(member.id).has("VIEW_CHANNEL")) || (c.permissionsFor(member.id).has("MANAGE_CHANNELS"))) : (c.permissionsFor(member.id).has("VIEW_CHANNEL")));
    }
    const wocat = Util.discordSort(col.filter(c => !c.parent && c.type !== "GUILD_CATEGORY"));
    const textnp = wocat.filter(c => ['GUILD_TEXT', 'GUILD_STORE', 'GUILD_NEWS'].includes(c.type));
    const voicenp = wocat.filter(c => ['GUILD_VOICE', 'GUILD_STAGE_VOICE'].includes(c.type));
    if (wocat.size >= 1) {
      text += textnp.map(advancedmap).join("\n");
      text += voicenp.map(advancedmap).join("\n");
    }
    const voiceChannels = col.filter(c => ['GUILD_VOICE', 'GUILD_STAGE_VOICE'].includes(c.type));
    const user = Collection.prototype.concat.apply(new Collection(), voiceChannels.map(e => e.members)).filter(e => !message.guild.members.cache.has(e.id)).map(e => e.id);
    if (user.length) await message.guild.members.fetch({ user });

    const cats = Util.discordSort(col.filter(c => c.type === "GUILD_CATEGORY"));
    cats.each(c => {
      const children = c.children.intersect(col);
      const textp = children.filter(c => ['GUILD_TEXT', 'GUILD_STORE', 'GUILD_NEWS'].includes(c.type));
      const voicep = children.filter(c => ['GUILD_VOICE', 'GUILD_STAGE_VOICE'].includes(c.type));
      text += "\n[📂] " + c.name;
      text += textp.size ? ("\n\t" + Util.discordSort(textp).map(advancedmap).join("\n\t")) : "";
      text += voicep.size ? ("\n\t" + Util.discordSort(voicep).map(advancedmap).join("\n\t")) : "";
    });
    const split = Util.splitMessage(text);
    for (const i in split) {
      await message.channel.send(Formatters.codeBlock("Channel structure of " + message.guild.name + (member ? (" for " + (member.user ? member.user.tag : member.name)) : "") + "\n" + split[i]));
    }
  }
}

function advancedmap(c) {
  let r = "";
  switch (c.type) {
    case "GUILD_NEWS":
      r += "[📢] " + c.name;
      break;
    case "GUILD_TEXT":
      r += "[📃] " + c.name;
      break;
    case "GUILD_VOICE":
      r += "[🎙] " + c.name + (c.members.size.toString() ? (c.members.map(d => {
        if (d.user.bot) {
          return "\n\t\t[🤖] " + d.user.tag;
        } else {
          return "\n\t\t[🙎] " + d.user.tag;
        }
      })).join("") : "")
      break;
    case "GUILD_STAGE_VOICE":
      r += "[👪] " + c.name + (c.members.size.toString() ? (c.members.map(d => {
        if (d.user.bot) {
          return "\n\t\t[🤖] " + d.user.tag;
        } else {
          return "\n\t\t[🙎] " + d.user.tag;
        }
      })).join("") : "")
      break;
    case "GUILD_STORE":
      r += "[🏪] " + c.name;
      break;
    default:
      r += "[?] " + c.name;
      break;
  }
  return r;
}