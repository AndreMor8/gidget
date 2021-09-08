import { Util } from "discord.js";

export default class extends Command {
  constructor(options) {
    super(options);
    this.description = "See the channel overwrites";
    this.guildonly = true;
    this.aliases = ["overwrites"];
  }
  async run(bot, message, args) {
    const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[1]) || message.guild.channels.cache.find(c => c.name === args.slice(1).join(" ")) || message.guild.channels.cache.find(c => c.parentId === message.channel.parentId && c.position === parseInt(args[1])) || await message.guild.channels.fetch(args[1] || "123").catch(() => { }) || message.channel;
    if (channel.guild.id !== message.guild.id) return message.channel.send("The channel you have put belongs to another server.");
    const rr = channel.permissionOverwrites.cache.filter(m => m.type === "member" && !message.guild.members.cache.has(m.id)).map(m => m.id)
    if (rr.length) await message.guild.members.fetch({ user: rr });
    const permissions = channel.permissionOverwrites.cache.map(m => {
      let text = ``;
      if (m.type === "member") {
        if (bot.users.cache.get(m.id)) {
          if (bot.users.cache.get(m.id).bot) text += `[🤖] ${bot.users.cache.get(m.id).tag}:\n`;
          else text += `[🙎] ${bot.users.cache.get(m.id).tag}:\n`;
        } else {
          message.guild.members.fetch(m.id).then(n => {
            if (n.user.bot) text += `[🤖] ${n.user.tag}:\n`;
            else text += `[🙎] ${n.user.tag}:\n`;
          })
        }
      }
      else text += `[👪] ${message.guild.roles.cache.get(m.id).name}:\n`;
      let doit = false;
      if (m.allow.bitfield !== 0) {
        doit = true;
        text += `\t✅ => ${m.allow.toArray().join(", ")}`
      }
      if (m.deny.bitfield !== 0) {
        if (doit)text += `\n\t❌ => ${m.deny.toArray().join(", ")}`
        else text += `\t❌ => ${m.deny.toArray().join(", ")}`

      }
      return text;
    });
    if (!permissions[0]) return message.channel.send("There are no channel overrides here.")
    else {
      const contents = Util.splitMessage(`\`\`\`${permissions.join("\n\n")}\n${channel.permissionsLocked ? "The channel is synchronized with its parent category." : "The channel is not synchronized with its parent category."}\nChannel overrides for #${channel.name}\`\`\``, { maxLength: 2000 });
      for (const content of contents) message.channel.send(content)
    }
  }
}
