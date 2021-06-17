import Discord from "discord.js";
import Levels from "../../utils/discord-xp.js";

export default class extends Command {
  constructor(options) {
    super(options);
    this.aliases = ["lb", "top"];
    this.description = "Server leaderboard";
    this.guildonly = true;
    this.permissions = {
      user: [0n, 0n],
      bot: [0n, 16384n]
    };
  }
  async run(bot, message, args) {
    const page = (args[1] && (!isNaN(args[1]))) ? parseInt(args[1]) : 1;
    if(page < 1) return message.channel.send("Invalid number!");
    const msgDocument = message.guild.cache.levelconfig ? message.guild.levelconfig : await message.guild.getLevelConfig();
    if (!msgDocument) return message.channel.send("The levels on this server are disabled! Use `togglelevel system` to enable the system!");
    if (msgDocument && !msgDocument.levelsystem) return message.channel.send("The levels on this server are disabled! Use `togglelevel system` to enable the system!");
    
    const leaderboard = await Levels.fetchLeaderboard(message.guild.id);
    if (leaderboard.length < 1) return message.reply("Nobody's in leaderboard yet.");
    const pages = Math.ceil(leaderboard.length / 10);
    if(page > pages) return message.channel.send("Invalid number!");
    const lb = leaderboard.slice((page * 10) - 10, page * 10).map(e => `${(leaderboard.findIndex(i => i.guildID === e.guildID && i.userID === e.userID) + 1)}. ${"<@!" + e.userID + ">"} => **Level:** ${e.level} **XP:** ${e.xp.toLocaleString()}\n`).join("\n");
    const embed = new Discord.MessageEmbed()
      .setTitle('Leaderboard for ' + message.guild.name)
      .setDescription(lb)
      .setColor("RANDOM")
      .setThumbnail(message.guild.iconURL({ dynamic: true }))
      .setTimestamp()
      .setFooter(`Page ${page}/${pages}`);
    await message.channel.send({embeds: [embed]});
  }
}