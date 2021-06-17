const timer = new Set();
export default class extends Command {
  constructor(options) {
    super(options);
    this.description = "Reestablish roles for new members";
    this.guildonly = true;
    this.permissions = {
      user: [0n, 0n],
      bot: [1073741824n, 0n]
    };
  }
  async run(bot, message) {
    const u = timer.has(message.author.id);
    if (!u) {
      if (!message.member.permissions.has("ADMINISTRATOR")) {
        timer.add(message.author.id);
        setTimeout(() => {
          timer.delete(message.author.id);
        }, 21600000);
      }
    } else {
      return message.channel.send("You cannot use this command, wait 6 hours!");
    }
    const col = message.guild.emojis.cache.filter(e => e.roles.cache.first());
    if (!col.first())
      return message.channel.send("There are no emojis to update");

    col.each(e => {
      const c = e.roles.cache;
      e.edit({ roles: c });
    });
    await message.channel.send("Done, new role members should now be able to use the emoji");
  }
}