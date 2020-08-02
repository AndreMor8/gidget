const Discord = require("discord.js")
const os = require('os')
const cpuStat = require("cpu-stat");
const moment = require("moment")
require("moment-duration-format");
const { version } = require("../../index.js")
const { promisify } = require("util");
const p = promisify(cpuStat.usagePercent);
module.exports = {
  run: async (bot, message, args) => {
    let percent = await p();
    let embedStats = new Discord.MessageEmbed()
      .setTitle("***Stats***")
      .setColor("RANDOM")
      .setDescription('Gidget is alive! - Version ' + version)
      .addField("• Mem Usage", `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} / ${(os.totalmem() / 1024 / 1024).toFixed(2)} MB`, true)
      .addField("• Uptime ", `${moment.duration(Date.now() - bot.readyTimestamp, "ms").format("d [days], h [hours], m [minutes]")}`, true)
      .addField("• Discord.js", `v${Discord.version}`, true)
      .addField("• Node.js", `${process.version}`, true)
      .addField("• Hosting service", 'VPS', true)
      .addField("• CPU", `\`\`\`md\n${os.cpus().map(i => `${i.model}`)[0]}\`\`\``)
      .addField("• CPU usage", `\`${percent.toFixed(2)}%\``, true)
      .addField("• Arch", `\`${os.arch()}\``, true)
      .addField("• Platform", `\`\`${os.platform()}\`\``, true)
      .setFooter("Gidget stats")

    message.channel.send(embedStats)
  },
  aliases: [],
  description: "Bot stats",
}
