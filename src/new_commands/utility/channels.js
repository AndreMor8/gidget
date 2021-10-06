import { Util, Collection, Formatters } from "discord.js";
const timer = new Set();
export default class extends SlashCommand {
  constructor(options) {
    super(options)
    this.deployOptions.description = "Channel structure for a server...";
    this.deployOptions.options = [
      {
        name: "member",
        description: "Limit structure to the channels a member can see...",
        type: "USER",
        required: false,
      },
      {
        name: "role",
        description: "Limit structure to the channels a role can see...",
        type: "ROLE",
        required: false
      }
    ]
  }
  async run(bot, interaction) {
    if (!interaction.guild) return interaction.reply("The only channel I can see here is this.");
    if (interaction.user.id !== "577000793094488085") {
      if (!timer.has(interaction.user.id)) {
        timer.add(interaction.user.id);
        setTimeout(() => timer.delete(interaction.user.id), 60000);
      } else {
        return interaction.reply({ content: "Don't overload this command! (1 min cooldown)", ephemeral: true });
      }
    }
    let text = "";
    const eeee = interaction.options.getMember('member', false) || interaction.options.getRole('role', false);
    const member = (eeee?.members) ? eeee : await eeee?.fetch?.({ cache: true });
    let col = await interaction.guild.channels.fetch();
    await interaction.guild.channels.fetchActiveThreads();
    if (member) col = col.filter(c => c.type === "GUILD_CATEGORY" ? (c.children.some(r => r.permissionsFor(member.id).has("VIEW_CHANNEL")) || (c.permissionsFor(member.id).has("MANAGE_CHANNELS"))) : (c.permissionsFor(member.id).has("VIEW_CHANNEL")));
    const wocat = Util.discordSort(col.filter(c => !c.parent && c.type !== "GUILD_CATEGORY"));
    const textnp = wocat.filter(c => c.isText() || c.type === "GUILD_STORE");
    const voicenp = wocat.filter(c => c.isVoice());
    if (wocat.size >= 1) {
      text += textnp.map(advancedmap).join("\n");
      text += voicenp.map(advancedmap).join("\n");
    }
    const voiceChannels = col.filter(c => c.isVoice());
    const user = Collection.prototype.concat.apply(new Collection(), voiceChannels.map(e => e.members)).filter(e => !interaction.guild.members.cache.has(e.id)).map(e => e.id);
    if (user.length) await interaction.guild.members.fetch({ user });

    const cats = Util.discordSort(col.filter(c => c.type === "GUILD_CATEGORY"));
    cats.each(c => {
      const children = c.children.intersect(col);
      const textp = children.filter(c => ['GUILD_TEXT', 'GUILD_STORE', 'GUILD_NEWS'].includes(c.type));
      const voicep = children.filter(c => c.isVoice());
      text += "\n[📂] " + c.name;
      text += textp.size ? ("\n\t" + Util.discordSort(textp).map(advancedmap).join("\n\t")) : "";
      text += voicep.size ? ("\n\t" + Util.discordSort(voicep).map(advancedmap).join("\n\t")) : "";
    });
    const split = Util.splitMessage(text);
    for (const i in split) {
      if (interaction.replied) await interaction.followUp(Formatters.codeBlock("Channel structure of " + interaction.guild.name + (member ? (" for " + (member.user ? member.user.tag : member.name)) : "") + "\n" + split[i]));
      else await interaction.reply(Formatters.codeBlock("Channel structure of " + interaction.guild.name + (member ? (" for " + (member.user ? member.user.tag : member.name)) : "") + "\n" + split[i]));
    }
  }
}

function advancedmap(c) {
  let r = "";
  switch (c.type) {
    case "GUILD_NEWS":
      r += "[📢] " + c.name + (c.threads.cache.size ? c.threads.cache.map(d => {
        return "\n\t\t[🧵] " + d.name;
      }).join("") : "");
      break;
    case "GUILD_TEXT":
      r += "[📃] " + c.name + (c.threads.cache.size ? c.threads.cache.map(d => {
        return "\n\t\t[🧵] " + d.name;
      }).join("") : "");
      break;
    case "GUILD_VOICE":
      r += "[🎙] " + c.name + (c.members.size.toString() ? (c.members.map(d => {
        if (d.user.bot) {
          return "\n\t\t[🤖] " + d.user.tag;
        } else {
          return "\n\t\t[🙎] " + d.user.tag;
        }
      })).join("") : "")
      break;
    case "GUILD_STAGE_VOICE":
      r += "[👪] " + c.name + (c.members.size.toString() ? (c.members.map(d => {
        if (d.user.bot) {
          return "\n\t\t[🤖] " + d.user.tag;
        } else {
          return "\n\t\t[🙎] " + d.user.tag;
        }
      })).join("") : "")
      break;
    case "GUILD_STORE":
      r += "[🏪] " + c.name;
      break;
    default:
      r += "[?] " + c.name;
      break;
  }
  return r;
}