import { MessageEmbed, MessageActionRow, MessageButton, version } from "discord.js";
import os from 'os';
import mongoose from 'mongoose';
import cpuStat from "cpu-stat";
import moment from "moment";
import "moment-duration-format";
import { promisify } from "util";
const usagePercent = promisify(cpuStat.usagePercent);
export default class extends SlashCommand {
  constructor(options) {
    super(options)
    this.deployOptions.description = "See bot stats, like hosting, ping, servers, etc.";
    this.permissions = {
      user: [0n, 0n],
      bot: [0n, 16384n]
    };
  }
  async run(bot, interaction) {
    const msg = await interaction.deferReply({ ephemeral: true, fetchReply: true });

    //PING EMBED
    const pings = [`📨 Message ping: ${Date.now() - msg.createdTimestamp}ms`, `📡 Ping from the API: ${(await bot.shard.broadcastEval(c => c.ws.ping)).reduce((a, c, i, arr) => i === (arr.length - 1) ? (a + c) / arr.length : a + c, 0)}ms`, `📦 Shard ${bot.shard?.ids[0] || 0} ping: ${bot.ws.ping || "?"}ms`];
    const dbping = await new Promise((s, r) => {
      try {
        const dates = Date.now();
        mongoose.connection.db.admin().ping(function (err, result) {
          if (err || !result) return r(err || new Error("No ping for the DB"));
          s(Date.now() - dates);
        });
      } catch (error) {
        r(error);
      }
    });
    pings.push(`🗃️ DB ping: ${dbping}ms`);
    const pingembed = new MessageEmbed()
      .setColor("AQUA")
      .setTitle("Bot ping")
      .setDescription(pings.join("\n\n"));

    //SERVERS EMBED
    const servers = (await bot.shard.broadcastEval(c => c.guilds.cache)).map(e => e.length).reduce((acc, guildCount) => acc + guildCount, 0);
    const users = (await bot.shard.broadcastEval(c => c.users.cache)).map(e => e.length).reduce((acc, userCount) => acc + userCount, 0);
    const members = Array.prototype.concat.apply([], await bot.shard.broadcastEval(c => c.guilds.cache.map(e => e.memberCount)));
    const average = Math.round(members.reduce((p, c) => c += p) / members.length);
    const serverembed = new MessageEmbed()
      .setTitle('Server count')
      .setDescription(`At the moment I'm in **${servers}** servers and with **${users}** cached online users.`, true)
      .setFooter(`I have an average of ${average} members in the number of members of all servers I'm in`)
      .setColor(0xfffff9)

    //GENERAL STATS EMBED
    const percent = await usagePercent();
    const memoryU = `Resident Set: ${memory(process.memoryUsage.rss())}\nHeap Used: ${memory(process.memoryUsage().heapUsed)}`;
    const vcs = (await bot.shard.broadcastEval(c => c.voice.adapters.size)).reduce((a, c) => a + c, 0);
    const statsembed = new MessageEmbed()
      .setTitle("***Stats***")
      .setColor("RANDOM")
      .setDescription(`Gidget is alive! - Version ${bot.botVersion} from shard ${bot.shard?.ids[0] || 0}`)
      .addField("• RAM", `${memory(os.totalmem() - os.freemem(), false)} / ${memory(os.totalmem())}`, true)
      .addField(`• Bot RAM usage (shard ${bot.shard?.ids[0] || 0})`, memoryU, true)
      .addField("• Uptime ", `${moment.duration(Date.now() - bot.readyTimestamp, "ms").format("d [days], h [hours], m [minutes]")}`, true)
      .addField("• Discord.js", `v${version}`, true)
      .addField("• Node.js", `${process.version}`, true)
      .addField("• Hosting service", process.env.HOSTER, true)
      .addField("• Operating system", `\`\`\`md\n${os.version()}\n${os.release()}\`\`\``)
      .addField("• CPU", `\`\`\`md\n${os.cpus()[0].model}\`\`\``)
      .addField("• Shards", bot.shard.count.toString(), true)
    if (vcs) statsembed.addField("• Voice connections", vcs.toString(), true)
    statsembed.addField("• CPU usage", `\`${percent.toFixed(2)}%\``, true)
      .addField("• Arch", `\`${os.arch()}\``, true)
      .addField("• Platform", `\`\`${os.platform()}\`\``, true)
      .setFooter("Gidget stats");

    await interaction.editReply({ ephemeral: true, embeds: [pingembed, serverembed, statsembed], components: [new MessageActionRow().addComponents([new MessageButton().setStyle("LINK").setLabel("Gidget Dashboard status").setURL("https://gidget.andremor.dev/stats")])] });
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
