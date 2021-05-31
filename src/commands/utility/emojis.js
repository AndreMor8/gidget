import { Util } from "discord.js";

export default class extends Command {
  constructor(options) {
    super(options);
    this.description = "Show all guild emojis";
    this.guildonly = true;
  }
  async run(bot, message) {
    const allEmojis = await message.guild.emojis.fetch();

    const fullN = allEmojis.size;

    if (fullN < 1)
      return message.reply('I don\'t see any emoji here.');

    const commonN = allEmojis.filter(e => e.available && !e.animated && (e.roles.cache.size >= 1 ? e.roles.cache.intersect(message.guild.me.roles.cache).size >= 1 : true)).size;

    const animatedN = allEmojis.filter(e => e.available && e.animated && (e.roles.cache.size >= 1 ? e.roles.cache.intersect(message.guild.me.roles.cache).size >= 1 : true)).size;

    const cantuse = allEmojis.filter(e => e.available && e.roles.cache.size >= 1 ? e.roles.cache.intersect(message.guild.me.roles.cache).size < 1 : false).size;

    const atext = allEmojis.filter(e => e.available && e.animated && (e.roles.cache.size >= 1 ? e.roles.cache.intersect(message.guild.me.roles.cache).size >= 1 : true)).map(e => e.toString()).join(" ");

    const ntext = allEmojis.filter(e => e.available && !e.animated && (e.roles.cache.size >= 1 ? e.roles.cache.intersect(message.guild.me.roles.cache).size >= 1 : true)).map(e => e.toString()).join(" ");

    const ctext = allEmojis.filter(e => e.available && e.roles.cache.size >= 1 ? e.roles.cache.intersect(message.guild.me.roles.cache).size < 1 : false).map(e => e.name).join(", ");

    const utext = allEmojis.filter(e => !e.available).map(e => e.name).join(", ");
    const unavailable = allEmojis.filter(e => !e.available).size;

    let realtext = "";

    let a = false;
    let n = false;
    let c = false;

    if (animatedN > 0) {
      a = true;
      realtext += `**Animated (${animatedN}): ** ${atext}\n`;
    }

    if (commonN > 0) {
      n = true;
      if (a)
        realtext += `\n**Common (${commonN}): ** ${ntext}\n`;
      else
        realtext += `**Common (${commonN}): ** ${ntext}\n`;
    }

    if (cantuse > 0) {
      c = true;
      if (n)
        realtext += `\n**I can't use (${cantuse}): ** ${ctext}\n`;
      else
        realtext += `**I can't use (${cantuse}): ** ${ctext}\n`;
    }

    if (unavailable > 0) {
      if (c)
        realtext += `\n\n**Unavailable (${unavailable}): ** ${utext}\n`;
      else
        realtext += `**Unavailable (${unavailable}): ** ${utext}\n`;
    }
    const contents = Util.splitMessage(realtext, { char: " ", maxLength: 2000 });
    for (const content of contents) {
      message.channel.send(content);
    }
  }
}