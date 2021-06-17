export default class extends Command {
  constructor(options) {
    super(options);
    this.aliases = [];
    this.guildonly = true;
    this.description = "Remove the warning from a member.";
    this.permissions = {
      user: [4n, 0n],
      bot: [0n, 0n]
    };
  }
  async run(bot, message, args) {
    if(!args[1]) return message.channel.send("Usage: `pardon <member> <warn_id> [reason]`");
    const member = message.mentions.members.first() || message.guild.members.cache.get(args[1]) || await message.guild.members.fetch(args[1] || "123").catch(() => {});
    if(!member) return message.channel.send("Invalid member!");
    if(message.member.id !== message.guild.ownerID) {
      if(member.roles.highest.comparePositionTo(message.member.roles.highest) > 0) return message.channel.send("You cannot pardon someone with a role with a higher or equal rank than yours.");
    }
    if(!args[2]) return message.channel.send("Put the warn ID!\nGet one with `warnings <member>`");
    const warns = await member.deleteWarn(args[2], args.slice(3).join(" "));
    message.channel.send(`I've pardoned ${member.toString()}${args.slice(3).join(" ") ? (" with reason: " + args.slice(3).join(" ")) : ""}. Now they have ${warns} warning(s)`);
  }
}