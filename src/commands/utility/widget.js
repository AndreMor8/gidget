import { MessageEmbed, Util } from 'discord.js';
import fetch from 'node-fetch';
export default class extends Command {
    constructor(options) {
        super(options);
        this.description = "View guild widget information.";
    }
    async run(bot, message, args) {
        let guild = bot.guilds.cache.get(args[1]) || bot.guilds.cache.find(e => e.name === args.slice(1).join(" ")) || (args[1] ? undefined : message.guild);
        if (!guild) guild = { id: args[1] };
        const res = await fetch(`https://discord.com/api/guilds/${guild.id}/widget.json`);
        const json = await res.json();
        if (!res.ok) return message.channel.send("Error: " + json.message);
        const embed = new MessageEmbed()
            .setTitle(`Widget information for ${json.name}`)
            .addField("Enabled instant invite?", (json.instant_invite ? `[Yes](${json.instant_invite})` : "No") || "?")
            .addField("Voice channels", Util.splitMessage(json.channels.sort((b, a) => b.position - a.position).map(e => `${e.name} (${e.id})`).join("\n"), { maxLength: 950 })[0] || "No channels")
            .addField("Member Count", (json.members.length > 99) ? "100 or more" : json.members.length.toString())
            .addField("Presence Count", json.presence_count.toString())
            .addField("Links", `[Widget JSON](https://discord.com/api/guilds/${json.id}/widget.json) - [Widget](https://discord.com/widget?id=${json.id}&theme=dark) - [Widget Image](https://discord.com/api/v7/guilds/${json.id}/widget.png)`);
        await message.channel.send({ embeds: [embed] });
    }
}