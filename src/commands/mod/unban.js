//needs rewrite
export default class extends Command {
  constructor(options) {
    super(options);
    this.aliases = [];
    this.description = "Unban a member from the server";
    this.guildonly = true;
    this.permissions = {
      user: [4n, 0n],
      bot: [4n, 0n]
    };
  }
  async run(bot, message, args) {
    let banInfo;
    try {
      const form = await message.guild.fetchBans();
      banInfo = await form.get(args[1]) || form.find(ban => ban.user.username == args.slice(1).join(" ")) || form.find(ban => ban.user.tag == args.slice(1).join(" "));
      if (!banInfo) {
        return message.channel.send('User not found.');
      }
    } catch (err) {
      return message.channel.send('Some error ocurred while fetching the bans. Here\'s a debug: ' + err);
    }
    try {
      await message.guild.members.unban(banInfo.user, "Unban command");
      await message.channel.send(`I've unbanned ${banInfo.user.tag} correctly.`);
    } catch (err) {
      await message.channel.send('I had an error while unbanning this user. Here\'s a debug: ' + err);
    }
  }
}