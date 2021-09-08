import { getLevelConfig, changeLevelConfig } from "../../extensions.js";
export default class extends Command {
  constructor(options) {
    super(options)
    this.description = "Change if you want levels on your server or not.";
    this.guildonly = true;
    this.permissions = {
      user: [8n, 0n],
      bot: [0n, 0n]
    }
  }
  async run(bot, message, args) {
    if (!args[1]) return message.channel.send("Usage: `togglelevel <system/notif>`");
    const reference = await getLevelConfig(message.guild);
    switch (args[1]) {
      case "notif":
        await changeLevelConfig(message.guild, "levelnotif", !reference.levelnotif)
        await message.channel.send(`Now the level-up notifications are: ${!reference.levelnotif ? "Enabled" : "Disabled"}`)
        break;
      case "system":
        await changeLevelConfig(message.guild, "levelsystem", !reference.levelsystem)
        await message.channel.send(`Now the level system is: ${!reference.levelsystem ? "Enabled" : "Disabled"}`)
        break;
      default:
        await message.channel.send("Invalid mode!");
    }
  }
}