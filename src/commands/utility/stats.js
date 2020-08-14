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
      .addField("• RAM", `${memory(os.totalmem() - os.freemem(), false)} / ${memory(os.totalmem())}`, true)
      .addField("• Process RAM usage", memory(process.memoryUsage().rss), true)
      .addField("• Uptime ", `${moment.duration(Date.now() - bot.readyTimestamp, "ms").format("d [days], h [hours], m [minutes]")}`, true)
      .addField("• Discord.js", `v${Discord.version}`, true)
      .addField("• Node.js", `${process.version}`, true)
      .addField("• Hosting service", 'Azure', true)
      .addField("• Operating system", `\`\`\`md\n${os.version()}\n${os.release()}\`\`\``)
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

function memory(bytes = 0, r = true){
  const gigaBytes = bytes / 1024**3;
  if(gigaBytes > 1){
      return `${gigaBytes.toFixed(1)} ${r ? "GB" : ""}`;
  }
  
  const megaBytes = bytes / 1024**2;
  if(megaBytes > 1){
      return `${megaBytes.toFixed(2)} ${r ? "MB" : ""}`;
  }

  const kiloBytes = bytes / 1024;
  if(kiloBytes > 1){
      return `${kiloBytes.toFixed(2)} ${r ? "KB" : ""}`;
  }
  
  return `${bytes.toFixed(2)} ${r ? "B" : ""}`;
}