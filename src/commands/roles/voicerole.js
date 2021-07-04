import db from '../../database/models/voicerole.js';
import { MessageEmbed } from 'discord.js';

export default class extends Command {
    constructor(options) {
        super(options);
        this.description = "Give a role when a member joins specific voice channels.";
        this.permissions = {
            user: [8n, 0n],
            bot: [268435456n, 0n]
        };
        this.guildonly = true;
        this.aliases = ["vr"];
    }
    async run(bot, message, args) {
        let list = await db.findOne({ guildID: { $eq: message.guild.id } });
        if (!list) {
            list = await db.create({
                guildID: message.guild.id
            });
        }
        if (!args[1]) {
            const embed = new MessageEmbed()
                .setColor("RANDOM")
                .setTitle("Voice role configuration")
                .setDescription("`voicerole add <role> <channel(s)>`: Add a role to the system in which if a member joins one of those, the role will be added.\n`voicerole remove <role>`: Removes a role from the system.\n`voicerole edit <role> <channel(s)>`: Edit an existing role in the system. This is a `set` subcommand.\n`voicerole enable`: Enables this system")
                .addField("Enabled?", (list.enabled ? "Yes" : "No"))
            for (const option of list.list) {
                const role = message.guild.roles.cache.get(option.roleID);
                if (!role) continue;
                embed.addField(`${role.name} (${role.id})`, option.channels.map(e => `<#${e}>`).join(", ") || "No channels");
            }
            await message.channel.send({embeds: [embed]});
        } else {
            const acl = await message.guild.channels.fetch();
            const allChannels = acl.filter(e => e.type === "voice");
            switch (args[1].toLowerCase()) {
                case "enable": {
                    await list.updateOne({ enabled: (list.enabled ? false : true) });
                    await message.channel.send("Now this system is " + (!list.enabled ? "enabled" : "disabled"));
                }
                    break;
                case "add": {
                    if (!args[2]) return message.channel.send("`voicerole add <role> <channel(s)>`");
                    const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[2]) || message.guild.roles.cache.find(e => e.name === args[2]);
                    if (!role) return message.channel.send("Invalid role");
                    if (!role.editable || role.managed) return message.channel.send("I can't give that role :(")
                    if (list.list.find(e => e.roleID === role.id)) return message.channel.send("That role is already set in the database");
                    const channels = message.mentions.channels.size ? message.mentions.channels.keyArray() : args.slice(3);
                    if (channels.length < 1) return message.channel.send("No channels selected");
                    const realchannels = [];
                    for (const channel of channels) {
                        if (allChannels.get(channel)) realchannels.push(channel);
                        else {
                            const rc = allChannels.find(e => e.name === channel);
                            if(rc) realchannels.push(rc.id);
                        }
                    }
                    if (realchannels.length < 1) return message.channel.send("No channels selected");
                    await list.updateOne({ $push: { list: { roleID: role.id, channels: realchannels } } });
                    await message.channel.send("The role and channels have been added to the database.");
                }
                    break;
                case "remove": {
                    if (!args[2]) return message.channel.send(`voicerole remove <roleid>`);
                    let role = message.mentions.roles.first() || message.guild.roles.cache.get(args[2]) || message.guild.roles.cache.find(e => e.name === args.slice(2).join(" "));
                    if (!role) role = { id: args[2] };
                    if (!list.list.find(e => e.roleID === role.id)) return message.channel.send("No role found in the database");
                    await list.updateOne({ $pull: { list: { roleID: role.id } } });
                    await message.channel.send("The role has been removed from the DB.");
                }
                    break;
                case "set":
                case "edit": {
                    if (!args[2]) return message.channel.send("`voicerole edit <role> <channel(s)>`\nThis is a `set` subcommand, so you must put a full list");
                    const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[2]) || message.guild.roles.cache.find(e => e.name === args[2]);
                    if (!role) return message.channel.send("Invalid role");
                    if (!role.editable || role.managed) return message.channel.send("I can't give that role :(")
                    const thing = list.list.find(e => e.roleID === role.id);
                    if (thing) {
                        const channels = message.mentions.channels.size ? message.mentions.channels.keyArray() : args.slice(3);
                        if (channels.length < 1) return message.channel.send("No channels selected");
                        const realchannels = [];
                        for (const channel of channels) {
                            if (allChannels.get(channel)) realchannels.push(channel);
                            else {
                                const rc = allChannels.find(e => e.name === channel);
                                if(rc) realchannels.push(rc.id);
                            }
                        }
                        if (realchannels.length < 1) return message.channel.send("No channels selected");
                        thing.channels = realchannels;
                        const newarr = list.list.filter(e => e.roleID !== role.id);
                        newarr.push(thing);
                        await list.updateOne({ list: newarr });
                        await message.channel.send("Updated channel list.");
                    }
                }
                    break;
                default:
                    await message.channel.send("Invalid option");
            }
        }
    }
}