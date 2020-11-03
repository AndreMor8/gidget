
import Discord from "discord.js";
import os from 'os';
import cpuStat from "cpu-stat";
import moment from "moment";
import "moment-duration-format";
import { promisify } from "util";
const usagePercent = promisify(cpuStat.usagePercent);
export default class extends Command {
  constructor(options) {
    super(options)
    this.description = "Bot stats";
    this.permissions = {
      user: [0, 0],
      bot: [0, 16384]
    };
  }
  async run(bot, message) {
    let percent = await usagePercent();
    let embedStats = new Discord.MessageEmbed()
      .setTitle("***Stats***")
      .setColor("RANDOM")
      .setDescription('Gidget is alive! - Version ' + global.botVersion)
      .addField("• RAM", `${memory(os.totalmem() - os.freemem(), false)} / ${memory(os.totalmem())}`, true)
      .addField("• Process RAM usage", memory(process.memoryUsage().rss), true)
      .addField("• Uptime ", `${moment.duration(Date.now() - bot.readyTimestamp, "ms").format("d [days], h [hours], m [minutes]")}`, true)
      .addField("• Discord.js", `v${Discord.version}`, true)
      .addField("• Node.js", `${process.version}`, true)
      .addField("• Hosting service", process.env.HOSTER, true)
      .addField("• Operating system", `\`\`\`md\n${os.version()}\n${os.release()}\`\`\``)
      .addField("• CPU", `\`\`\`md\n${os.cpus().map(i => `${i.model}`)[0]}\`\`\``)
    if (bot.voice.connections.size) {
      embedStats.addField("Voice connections", bot.voice.connections.size.toString())
    }
    embedStats.addField("• CPU usage", `\`${percent.toFixed(2)}%\``, true)
      .addField("• Arch", `\`${os.arch()}\``, true)
      .addField("• Platform", `\`\`${os.platform()}\`\``, true)
      .setFooter("Gidget stats")

    await message.channel.send(embedStats)
  }
}

/**
 * @param bytes
 * @param r
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