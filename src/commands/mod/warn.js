export default class extends Command {
  constructor(options) {
    super(options)
    this.description = "Warn a member";
    this.guildonly = true;
    this.permissions = {
      user: [4n, 0n],
      bot: [268435456n, 0n]
    };
  }
  async run(bot, message, args) {
    if(!args[1]) return message.channel.send("Usage: `warn <member> [reason]`");
    const member = message.mentions.members.first() || message.guild.members.cache.get(args[1]) || await message.guild.members.fetch(args[1] || "123").catch(() => {});
    if(!member) return message.channel.send("Invalid member!");
    if(member.id === message.guild.ownerID) return message.channel.send("You cannot warn the owner.");
    if(message.member.id !== message.guild.ownerID) {
      if(member.roles.highest.comparePositionTo(message.member.roles.highest) >= 0) return message.channel.send("You cannot warn someone with a role with a higher or equal rank than yours.");
    }
    const warns = await member.setWarn(args.slice(2).join(" "));
    message.channel.send(`I've warned ${member.toString()}${args.slice(2).join(" ") ? (" with reason: " + args.slice(2).join(" ")) : ""}. Now they have ${warns} warning(s).`);
  }
}