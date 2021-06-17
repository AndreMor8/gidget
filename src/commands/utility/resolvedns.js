import { MessageEmbed } from 'discord.js';
import { promises as dns } from 'dns';
export default class extends Command {
    constructor(options) {
        super(options);
        this.description = "This command will make an DNS request to the domain you choose, and will show the corresponding records.";
    }
    async run(client, message, args) {
        if (!args[1]) return message.channel.send("Enter a valid domain name (FQDN).\n`resolvedns [type] <domain>`");
        try {
            switch (args[1].toLowerCase()) {
                case "a": {
                    const results = await dns.resolve4(args[2]);
                    if (!results.length) return message.channel.send("No A records found...");
                    const embed = new MessageEmbed()
                        .setTitle("A records for " + args[2])
                        .setDescription(results.join("\n"));
                    message.channel.send({ embeds: [embed] });
                }
                    break;
                case "aaaa": {
                    const results = await dns.resolve6(args[2]);
                    if (!results.length) return message.channel.send("No AAAA records found...");
                    const embed = new MessageEmbed()
                        .setTitle("AAAA records for " + args[2])
                        .setDescription(results.join("\n"));
                    message.channel.send({ embeds: [embed] });
                }
                    break;
                case "mx": {
                    const results = await dns.resolveMx(args[2]);
                    if (!results.length) return message.channel.send("No MX records found...");
                    let text = ``;
                    for (const result of results) {
                        text += `Exchange: ${result.exchange}, priority: ${result.priority}\n`;
                    }
                    const embed = new MessageEmbed()
                        .setTitle("MX records for " + args[2])
                        .setDescription(text);
                    message.channel.send({ embeds: [embed] });
                }
                    break;
                case "ns": {
                    const results = await dns.resolveNs(args[2]);
                    if (!results.length) return message.channel.send("No NS records found...");
                    const embed = new MessageEmbed()
                        .setTitle("NS records for " + args[2])
                        .setDescription(results.join("\n"));
                    message.channel.send({ embeds: [embed] });
                }
                    break;
                case "cname": {
                    const results = await dns.resolveCname(args[2]);
                    if (!results.length) return message.channel.send("No CNAME records found...");
                    const embed = new MessageEmbed()
                        .setTitle("CNAME records for " + args[2])
                        .setDescription(results.join("\n"));
                    message.channel.send({ embeds: [embed] });
                }
                    break;
                default: {
                    const results = await dns.resolve4(args[1]);
                    if (!results.length) return message.channel.send("No A records found...");
                    const embed = new MessageEmbed()
                        .setTitle("A records for " + args[1])
                        .setDescription(results.join("\n"));
                    message.channel.send({ embeds: [embed] });
                }
            }
        } catch (err) {
            message.channel.send("Error: " + err.toString());
        }
    }
}