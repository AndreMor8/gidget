import Discord from "discord.js";
import os from 'os';
import cpuStat from "cpu-stat";
import moment from "moment";
import "moment-duration-format";
import { promisify } from "util";
const usagePercent = promisify(cpuStat.usagePercent);
export default class extends SlashCommand {
  constructor(options) {
    super(options)
    this.deployOptions.description = "See how the bot is doing at home.";
    this.permissions = {
      user: [0n, 0n],
      bot: [0n, 16384n]
    };
  }
  async run(bot, interaction) {
    await interaction.defer({ ephemeral: true });
    const percent = await usagePercent();
    const memoryU = `Resident Set: ${memory(process.memoryUsage.rss())}\nHeap Used: ${memory(process.memoryUsage().heapUsed)}`;
    const vcs = (await bot.shard.broadcastEval(c => c.voice.adapters.size)).reduce((a, c) => a + c, 0);
    const embedStats = new Discord.MessageEmbed()
      .setTitle("***Stats***")
      .setColor("RANDOM")
      .setDescription(`Gidget is alive! - Version ${bot.botVersion} from shard ${bot.shard?.ids[0] || 0}`)
      .addField("• RAM", `${memory(os.totalmem() - os.freemem(), false)} / ${memory(os.totalmem())}`, true)
      .addField(`• Bot RAM usage (shard ${bot.shard?.ids[0] || 0})`, memoryU, true)
      .addField("• Uptime ", `${moment.duration(Date.now() - bot.readyTimestamp, "ms").format("d [days], h [hours], m [minutes]")}`, true)
      .addField("• Discord.js", `v${Discord.version}`, true)
      .addField("• Node.js", `${process.version}`, true)
      .addField("• Hosting service", process.env.HOSTER, true)
      .addField("• Operating system", `\`\`\`md\n${os.version()}\n${os.release()}\`\`\``)
      .addField("• CPU", `\`\`\`md\n${os.cpus()[0].model}\`\`\``)
      .addField("• Shards", bot.shard.count.toString(), true)
    if (vcs) {
      embedStats.addField("• Voice connections", vcs.toString(), true)
    }
    embedStats.addField("• CPU usage", `\`${percent.toFixed(2)}%\``, true)
      .addField("• Arch", `\`${os.arch()}\``, true)
      .addField("• Platform", `\`\`${os.platform()}\`\``, true)
      .setFooter("Gidget stats");

    await interaction.editReply({ ephemeral: true, embeds: [embedStats], components: [new Discord.MessageActionRow().addComponents([new Discord.MessageButton().setStyle("LINK").setLabel("Gidget Dashboard status").setURL("https://gidget.xyz/stats")])] });
  }
}

/**
 * @param {Number} bytes
 * @param {Boolean} r
 * @returns {string}
 */
function memory(bytes = 0, r = true) {
  const gigaBytes = bytes / 1024 ** 3;
  if (gigaBytes > 1) {
    return `${gigaBytes.toFixed(1)} ${r ? "GB" : ""}`;
  }

  const megaBytes = bytes / 1024 ** 2;
  if (megaBytes > 1) {
    return `${megaBytes.toFixed(2)} ${r ? "MB" : ""}`;
  }

  const kiloBytes = bytes / 1024;
  if (kiloBytes > 1) {
    return `${kiloBytes.toFixed(2)} ${r ? "KB" : ""}`;
  }

  return `${bytes.toFixed(2)} ${r ? "B" : ""}`;
}
