import db from '../database/models/selectroles.js';
import { MessageEmbed, MessageSelectMenu } from "discord.js";

export default class extends SlashCommand {
    constructor(options) {
        super(options);
        this.description = "Use Discord's new menu selector to add self-roles to users in just 1 step.";
        this.options = [
            {
                name: "add",
                description: "Add roles(options) to use in a message later",
                type: "SUB_COMMAND",
                options: [{
                    name: "role",
                    description: "The role to add if selected.",
                    type: "ROLE",
                    required: true
                },
                {
                    name: "role-name",
                    description: "The name that will be displayed to the user, by default current role name. (MAX 25 CHARACTERS)",
                    type: "STRING",
                    required: false
                },
                {
                    name: "description",
                    description: "A short description for the role option (MAX 50 CHARACTERS)",
                    type: "STRING",
                    required: false
                },
                {
                    name: "emoji",
                    description: "A valid emoji",
                    type: "STRING",
                    required: false
                }
                ]
            },
            {
                name: "remove",
                description: "Remove roles(options)",
                type: "SUB_COMMAND",
                options: [{
                    name: "role",
                    description: "The role to remove from the list",
                    type: "ROLE",
                    required: false
                },
                {
                    name: "role-name",
                    description: "This is in case you removed the role. Put the name previously set to delete it from the list.",
                    type: "STRING",
                    required: false
                }]
            },
            {
                name: "clear",
                description: "Clear the added roles, so you can start another message with another list",
                type: "SUB_COMMAND"
            },
            {
                name: "view",
                description: "Check out the roles you added",
                type: "SUB_COMMAND",
            },
            {
                name: "create-instance",
                description: "Create a message with a list of the provided roles.",
                type: "SUB_COMMAND",
                options: [
                    {
                        name: "channel",
                        description: "On which channel will I send that message?",
                        type: "CHANNEL",
                        required: true
                    },
                    {
                        name: "placeholder",
                        description: "Text that will appear when the user views the menu without anything selected. (MAX 100 CHARACTERS)",
                        type: "STRING",
                        required: false
                    },
                    {
                        name: "content",
                        description: "Default message top content (MAX 2000 CHARACTERS)",
                        type: "STRING",
                        required: false
                    }]
            }
        ]
        this.guildonly = true;
        this.onlyguild = true;
        this.permissions = {
            user: [8n, 0n],
            bot: [268435456n, 0n]
        }
    }
    async run(bot, interaction) {
        if (!bot.guilds.cache.has(interaction.guild.id)) return interaction.reply("Please invite the real bot");
        const doc = await db.findOne({ guildId: interaction.guild.id })
        switch (interaction.options.first().name) {
            case 'add': {
                if (doc?.roles.length > 25) return interaction.reply("You can only have 25 roles(options) per list.")
                const option = {
                    id: interaction.options.get("add").options.find(e => e.name === "role").role.id,
                    name: interaction.options.get("add").options.find(e => e.name === "role-name")?.value || interaction.options.get("add").options.find(e => e.name === "role").role.name,
                    description: interaction.options.get("add").options.find(e => e.name === "description")?.value,
                    emoji: interaction.options.get("add").options.find(e => e.name === "emoji")?.value || 1
                }
                if (option.name.length > 25) return interaction.reply("[add.name] You can only put up to 25 characters max.");
                if (option.description.length > 50) return interaction.reply("[add.description] You can only put up to 50 characters max.");
                if (interaction.guild.emojis.cache.size < 1) await interaction.guild.emojis.fetch();
                const resolvedEmoji = (option.emoji !== 1 ? (interaction.guild.emojis.cache.get(option.emoji)?.identifier || interaction.guild.emojis.cache.find(e => e.name === option.emoji || e.toString() === option.emoji)?.identifier || (/(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/.test(option.emoji) ? option.emoji : undefined)) : undefined);
                if ((!resolvedEmoji) && (option.emoji !== 1)) return interaction.reply("[add.emoji] Invalid default or server emoji.");
                option.emoji = resolvedEmoji;
                if (doc) await doc.updateOne({ $push: { roles: option } });
                else await db.create({ guildId: interaction.guild.id, roles: [option] });
                interaction.reply("Role added to the list");
            }
                break;
            case 'remove': {
                if (!doc) return interaction.reply("[remove] Invalid role");
                if (interaction.options.get("remove").options?.find(e => e.name === "role")) {
                    const verify = doc.roles.find(e => e.id === interaction.options.get("remove").options.find(e => e.name === "role").role.id)
                    if (!verify) return interaction.reply("[remove.role] Invalid role");
                    else await doc.updateOne({ $pull: { roles: { id: { $eq: verify.id } } } });
                    interaction.reply("Role removed from the list");
                } else if (interaction.options.get("remove").options?.find(e => e.name === "role-name")) {
                    const verify = doc.roles.find(e => e.name === interaction.options.get("remove").options.find(e => e.name === "role-name").value)
                    if (!verify) return interaction.reply("[remove.role-name] Invalid role");
                    else await doc.updateOne({ $pull: { roles: { id: { $eq: verify.id } } } });
                    interaction.reply("Role removed from the list");
                } else interaction.reply("[remove] Specify at least one option.");
            }
                break;
            case 'clear': {
                if (!doc) return interaction.reply("[clear] Nothing to clean here.");
                else doc.deleteOne();
                interaction.reply("All the list has been cleared.");
            }
                break;
            case 'view': {
                if (!doc?.roles.length) return interaction.reply("You have nothing on the list. Add roles using `add`");
                const fields = doc.roles.map(e => {
                    return {
                        name: e.name,
                        value: `<@&${e.id}> -> ${e.description} -> ${e.emoji ? (/(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/.test(e.emoji) ? e.emoji : `<${(e.emoji.startsWith("a") ? "" : ":") + e.emoji}>`) : "*no emoji*"}`
                    }
                });
                const embed = new MessageEmbed()
                    .setTitle("Ready-to-use roles for the select menu")
                    .setColor("RANDOM")
                    .setTimestamp()
                    .addFields(fields);
                interaction.reply({ embeds: [embed] });
            }
                break;
            case 'create-instance': {
                if (!doc?.roles.length) return interaction.reply("You have nothing on the list. Add roles using `add`");
                if (interaction.options.get("create-instance").options.find(e => e.name === "placeholder")?.value.length > 100) return interaction.reply("[create-instace.placeholder] You can only put up to 100 characters max.");
                if (interaction.options.get("create-instance").options.find(e => e.name === "content")?.value.length > 2000) return interaction.reply("[create-instace.content] You can only put up to 2000 characters max.");
                const verify = doc.roles.every(e => interaction.guild.roles.cache.has(e.id));
                if (!verify) return interaction.reply("You seem to have an invalid role on the list. Fix it using `remove`.");
                const options = doc.roles.map(e => {
                    return {
                        label: e.name,
                        value: `selectroles_f_ro_${e.id}`,
                        description: e.description,
                        emoji: e.emoji
                    }
                });
                const menu = new MessageSelectMenu()
                    .setCustomID("selectroles_f")
                    .setMinValues(0)
                    .setMaxValues(doc.roles.length)
                    .setPlaceholder(interaction.options.get("create-instance").options.find(e => e.name === "placeholder")?.value)
                    .addOptions(options);
                const channel = interaction.options.get("create-instance").options.find(e => e.name === "channel").channel;
                if (!["text", "news"].includes(channel.type)) return interaction.reply("[create-instance.channel] That isn't a text-based channel!")
                if (!channel.permissionsFor(bot.user.id).has("SEND_MESSAGES")) return interaction.reply("[create-instance.channel] I don't have permissions to send messages in that channel!");
                await channel.send({ content: interaction.options.get("create-instance").options.find(e => e.name === "content")?.value, components: [[menu]] });
                interaction.reply("Message sent. Test it ;)")
            }
                break;
        }
    }
}