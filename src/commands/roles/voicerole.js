import Command from '../../utils/command.js';
import db from '../../database/models/voicerole.js';
import { MessageEmbed } from 'discord.js';

export default class extends Command {
    constructor(options) {
        super(options);
        this.description = "Give a role to members that are in a voice channel";
        this.permissions = {
            user: [8, 0],
            bot: [268435456, 0]
        },
            this.guildonly = true;
    }
    async run(message, args) {
        let list = await db.findOne({ guildID: { $eq: message.guild.id } });
        if (!list) {
            list = await db.create({
                guildID: message.guild.id
            });
        }
        if (!args[1]) {
            const embed = new MessageEmbed()
                .setTitle("Voice role options")
                .addField("Enabled?", (list.enabled ? "Yes" : "No"))
            for (const option of list.list) {
                const role = message.guild.roles.cache.get(option.roleID);
                if (!role) continue;
                embed.addField(`${role.name} (${role.id})`, option.channels.map(e => `<#${e}>`).join(", ") || "No channels");
            }
            message.channel.send(embed);
        } else {
            switch (args[1].toLowerCase()) {
                case "enable": {
                    await list.updateOne({ enabled: (list.enabled ? false : true) });
                    await message.channel.send("Now this system is " + (!list.enabled ? "enabled" : "disabled"));
                }
                    break;
                case "add": {
                    if (!args[2]) return message.channel.send("`voicerole add <role> <channel(s)>`");
                    const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[2]) || message.guild.roles.cache.map(e => e.name === args[2]);
                    if (!role) return message.channel.send("Invalid role");
                    if (!role.editable || role.managed) return message.channel.send("I can't give that role :(")
                    if (list.list.find(e => e.roleID === role.id)) return message.channel.send("That role is already set in the database");
                    const channels = message.mentions.channels.size ? message.mentions.channels.keyArray() : args.slice(3);
                    if (channels.length < 1) return message.channel.send("No channels selected");
                    const realchannels = [];
                    for (const channel of channels) {
                        if (message.guild.channels.cache.get(channel)) realchannels.push(channel);
                    }
                    if (realchannels.length < 1) return message.channel.send("No channels selected");
                    await list.updateOne({ $push: { list: { roleID: role.id, channels: realchannels } } });
                    await message.channel.send("Added");
                }
                    break;
                case "remove": {
                    if (!args[2]) return message.channel.send(`voicerole remove <roleid>`);
                    if (!list.list.find(e => e.roleID === args[2])) return message.channel.send("No role found in the database");
                    await list.updateOne({ $pull: { list: { roleID: args[2] } } });
                    await message.channel.send("Removed");
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
                            if (message.guild.channels.cache.get(channel)) realchannels.push(channel);
                        }
                        if (realchannels.length < 1) return message.channel.send("No channels selected");
                        thing.channels = realchannels;
                        const newarr = list.list.filter(e => e.roleID !== role.id);
                        newarr.push(thing);
                        await list.updateOne({ list: newarr });
                        await message.channel.send("Updated");
                    }
                }
                    break;
                default:
                    await message.channel.send("Invalid option");
            }
        }
    }
}



/*
Comando:

voicerole add [role] [channels]

add remove edit(set)
per role

Vista del array:

[{
    roleID: "ID del role",
    channels: ["id de canales", "id2"]
},
{
    roleID: "ID del otro role",
    channels: ["otras ids", "id2", "id3"]
}]

*/