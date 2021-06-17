
export default class extends Command {
  constructor(options) {
    super(options);
    this.aliases = ['hkb'];
    this.guildonly = true;
    this.description = "Ban people who are not on the server. (Only IDs)";
    this.permissions = {
      user: [4n, 0n],
      bot: [4n, 0n]
    }
  }
  async run(bot, message, args) {
    if (!args[1]) return message.channel.send('Put ~~snowflakes~~ user IDs to hackban them.');
    const users = [];
    for (const thing of args.slice(1)) {
      if (thing.length > 25) continue;
      if (isNaN(thing)) continue;
      const matched = thing.match(/^<@!?(\d+)>$/);
      if (matched && matched[1]) users.push(matched[1]);
      if (message.guild.members.cache.has(thing)) continue;
      users.push(thing);
    }
    if (users.length < 1) return message.channel.send("Invalid IDs. Make sure you have put them right.")
    for (const user of users) {
      try {
        await message.guild.members.ban(user, { reason: (users.length === 1 ? args.slice(2).join(" ") : undefined) });
      } catch (err) {
        if (err.code === 50035) await message.channel.send("Invalid ID!").catch(() => {});
        else await message.channel.send(`I couldn't hackban ${user}: ${err}`).catch(() => {});
      }
    }
    await message.channel.send("Operation completed.");
  }
}