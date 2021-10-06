//Note that if you dont like this command you can delete it safely because i made this when i was new to discordjs and it is not neccesary to the bot
export default class extends Command {
  constructor(options) {
    super(options);
    this.onlyguild = true;
    this.description = "Who is the best mod?";
  }
  async run(bot, message) {
    const mods = message.guild.roles.cache.get("617518093480230912")
    const map = mods.members.map(m => m.user.username);
    const i = mods.members.size;
    const text = "The best mod is:"
    const reason = ["For being friendly", "For supporting a lot", "For being responsible", "For doing a great job", "For doing great help to the community", "For being a big fan of the series"]
    await message.channel.send(text + " **" + map[Math.floor(Math.random() * i)] + "** \n" + "**Reason:** " + reason[Math.floor(Math.random() * 6)])
  }
}