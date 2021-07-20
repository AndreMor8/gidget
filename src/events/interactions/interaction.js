import tickets from "../../database/models/ticket.js";
import tmembers from "../../database/models/tmembers.js";
import Discord from 'discord.js-light';

const internalCooldown = new Set();

export default async (bot, interaction) => {
    if (interaction.isCommand()) {
        if (internalCooldown.has(interaction.user.id)) return interaction.reply({ content: "Calm down! Wait until the previous command finished executing.", ephemeral: true });
        const command = bot.slashCommands.get(interaction.commandName);
        if (!command) return interaction.reply({ content: "That command doesn't exist", ephemeral: true });
        if (!interaction.guild && command.guildonly) return interaction.reply("This command only works on servers");
        if (interaction.guild) {
            if (!bot.guilds.cache.has(interaction.guild.id) && command.requireBotInstance) return interaction.reply("Please invite the real bot");
            const userperms = interaction.member.permissions;
            const userchannelperms = interaction.channel.permissionsFor(interaction.member.id);
            const botperms = interaction.guild.me.permissions;
            const botchannelperms = interaction.channel.permissionsFor(bot.user.id);
            if (interaction.user.id !== "577000793094488085") {
                if (!userperms.has(command.permissions.user[0])) return interaction.reply("You do not have the necessary permissions to run this command.\nRequired permissions:\n`" + (!(new Discord.Permissions(command.permissions.user[0]).has(8n)) ? (new Discord.Permissions(command.permissions.user[0]).toArray().join(", ") || "None") : "ADMINISTRATOR") + "`");
                if (!userchannelperms.has(command.permissions.user[1])) return interaction.reply("You do not have the necessary permissions to run this command **in this channel**.\nRequired permissions:\n`" + (!(new Discord.Permissions(command.permissions.user[1]).has(8n)) ? (new Discord.Permissions(command.permissions.user[1]).toArray().join(", ") || "None") : "ADMINISTRATOR") + "`");
            }
            if (!botperms.has(command.permissions.bot[0])) return interaction.reply("Sorry, I don't have sufficient permissions to run that command.\nRequired permissions:\n`" + (!(new Discord.Permissions(command.permissions.bot[0]).has(8n)) ? (new Discord.Permissions(command.permissions.bot[0]).toArray().join(", ") || "None") : "ADMINISTRATOR") + "`");
            if (!botchannelperms.has(command.permissions.bot[1])) return interaction.reply("Sorry, I don't have sufficient permissions to run that command **in this channel**.\nRequired permissions:\n`" + (!(new Discord.Permissions(command.permissions.bot[1]).has(8n)) ? (new Discord.Permissions(command.permissions.bot[1]).toArray().join(", ") || "None") : "ADMINISTRATOR") + "`");
        }
        try {
            internalCooldown.add(interaction.user.id);
            await command.run(bot, interaction);
        } catch (err) {
            if (err.name === "StructureError") return interaction.reply(err.message).catch(() => { });
            console.error(err);
            await interaction.reply("Something happened! Here's a debug: " + err).catch(() => { });
        } finally {
            internalCooldown.delete(interaction.user.id);
        }
    }
    if (interaction.isSelectMenu() && interaction.customID === "selectroles_f") {
        if (!bot.guilds.cache.has(interaction.guild.id)) return interaction.deferUpdate();
        if (!interaction.guild.me.permissions.has("MANAGE_ROLES")) return interaction.reply({ content: "I don't have permissions to add roles. Contact an administrator to fix the problem.", ephemeral: true })
        const roles = interaction.values?.map(e => e.split("_")[3]) || [];
        if (!roles.length) return interaction.deferUpdate();
        const rolesToManage = roles.filter(e => interaction.guild.roles.cache.get(e)?.editable && !(interaction.guild.roles.cache.get(e)?.managed));
        if (!rolesToManage.length) interaction.reply({ content: `I cannot add/remove the requested role${roles.length ? "s" : ""}. Contact an administrator to fix the problem.`, ephemeral: true });
        else {
            const rolesToAdd = rolesToManage.filter(e => !interaction.member.roles.cache.has(e));
            const rolesToRemove = rolesToManage.filter(e => interaction.member.roles.cache.has(e));
            if (rolesToAdd.length) await interaction.member.roles.add(rolesToAdd, "Select-roles function");
            if (rolesToRemove.length) await interaction.member.roles.remove(rolesToRemove, "Select-roles function");
            if (roles.length === rolesToManage.length) interaction.reply({ content: `I've added/removed ${roles.length > 1 ? "all the roles" : "the role"} you have requested.`, ephemeral: true });
            else {
                const notManagedRoles = roles.filter(e => !rolesToManage.includes(e));
                interaction.reply({ content: `I've added/removed the requested roles except for: ${notManagedRoles.map(e => `<@&${e}>`).join(", ")}. Contact an administrator to fix the problem.`, ephemeral: true })
            }
        }
    }
    if (interaction.isButton() && interaction.customID === "ticket_f") {
        const doc = await tickets.findOne({
            guildId: { $eq: interaction.guildID },
            messageId: { $eq: interaction.message.id },
            channelId: { $eq: interaction.channelID }
        });

        if (doc) {
            const { categoryId } = doc;
            await bot.users.fetch(interaction.user.id);
            const doc2 = await tmembers.findOne({
                guildId: { $eq: interaction.guildID },
                from: { $eq: interaction.message.id },
                memberId: { $eq: interaction.user.id }
            });
            if (doc2) return interaction.reply({ content: "You already have a ticket!", ephemeral: true }).catch(() => { });
            const cat = interaction.guild.channels.cache.get(categoryId) || await interaction.guild.channels.fetch(categoryId).catch(() => { });
            if (!cat) return interaction.reply({ content: "I don't have permissions, sorry :(\nContact your server administrator.", ephemeral: true });
            if (!cat.permissionsFor(bot.user.id).has(["VIEW_CHANNEL", "MANAGE_CHANNELS", "MANAGE_ROLES"])) return interaction.reply({ content: "I don't have permissions, sorry :(\nContact your server administrator.", ephemeral: true });
            const todesc = doc.desc?.replace(/%AUTHOR%/g, interaction.user.toString());
            const ch = await interaction.guild.channels
                .create(`${interaction.user.username}s-ticket`, {
                    type: "text",
                    topic: todesc,
                    parent: cat,
                    reason: "User created a ticket!"
                }).catch(() => { });
            if (!ch) return interaction.reply({ content: "I don't have permissions, sorry :(\nContact your server administrator.", ephemeral: true });
            const tmp = await ch.createOverwrite(interaction.user.id, {
                VIEW_CHANNEL: true,
                SEND_MESSAGES: true,
                EMBED_LINKS: true,
                ATTACH_FILES: true
            }, { type: 1 }).catch(() => { });
            if (!tmp) return interaction.reply({ content: "I don't have permissions, sorry :(\nContact your server administrator.", ephemeral: true });

            await tmembers.create({
                guildId: interaction.guild.id,
                channelId: ch.id,
                memberId: interaction.user.id,
                from: interaction.message.id
            });

            if (doc.welcomemsg && ch.permissionsFor(bot.user.id).has("SEND_MESSAGES")) {
                const tosend = doc.welcomemsg.replace(
                    /%AUTHOR%/g,
                    interaction.user.toString()
                );
                ch.send({ content: tosend, allowedMentions: { parse: ['users', 'roles', 'everyone'] } }).catch(() => { });
            }
            await interaction.reply({ content: `Your ticket has been created! -> ${ch}`, ephemeral: true });

        } else {
            await interaction.deferUpdate();
            await interaction.message.delete();
        }
    }
}
