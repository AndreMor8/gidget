import tickets from "../../database/models/ticket.js";
import tmembers from "../../database/models/tmembers.js";
import Discord from 'discord.js';
import { languages } from 'google-translate-api-x';

const internalCooldown = new Set();

export default async (bot, interaction) => {
  if ((interaction.type === 2) || interaction.isContextMenuCommand()) {
    //Always fetch necessary resources
    if (interaction.guild) {
      await interaction.member.fetch({ cache: true }).catch(() => { });
      await interaction.channel.fetch({ cache: true }).catch(() => { });
    } else {
      await interaction.user.fetch({ cache: true }).catch(() => { });
      await interaction.user.createDM().catch(() => { });
    }
    if (internalCooldown.has(interaction.user.id)) return await interaction.reply({ content: "Calm down! Wait until the previous command finished executing.", ephemeral: true });
    const command = bot.slashCommands.get(interaction.commandName) || bot.slashCommands.find(e => e.deployOptions.name === interaction.commandName && e.deployOptions.type === e.deployOptions.targetType);
    if (!command) return await interaction.reply({ content: "That command doesn't exist", ephemeral: true });
    if (!interaction.guild && command.guildonly) return await interaction.reply("This command only works on servers");
    if (interaction.guild) {
      if (!bot.guilds.cache.has(interaction.guild.id) && command.requireBotInstance) return await interaction.reply("Please invite the real bot");
      const userperms = interaction.member.permissions;
      const userchannelperms = interaction.channel.permissionsFor(interaction.member.id);
      if (!userchannelperms) return;
      const botperms = interaction.guild.members.me.permissions;
      const botchannelperms = interaction.channel.permissionsFor(bot.user.id);
      if (!botchannelperms) return;
      if (interaction.user.id !== "577000793094488085") {
        if (!userperms.has(command.permissions.user[0])) return await interaction.reply({ content: "You do not have the necessary permissions to run this command.\nRequired permissions:\n`" + (!(new Discord.PermissionsBitField(command.permissions.user[0]).has(8n)) ? (new Discord.PermissionsBitField(command.permissions.user[0]).toArray().join(", ") || "None") : "Administrator") + "`", ephemeral: true });
        if (!userchannelperms.has(command.permissions.user[1])) return await interaction.reply({ content: "You do not have the necessary permissions to run this command **in this channel**.\nRequired permissions:\n`" + (!(new Discord.PermissionsBitField(command.permissions.user[1]).has(8n)) ? (new Discord.PermissionsBitField(command.permissions.user[1]).toArray().join(", ") || "None") : "Administrator") + "`", ephemeral: true });
      }
      if (!botperms.has(command.permissions.bot[0])) return await interaction.reply({ content: "Sorry, I don't have sufficient permissions to run that command.\nRequired permissions:\n`" + (!(new Discord.PermissionsBitField(command.permissions.bot[0]).has(8n)) ? (new Discord.PermissionsBitField(command.permissions.bot[0]).toArray().join(", ") || "None") : "Administrator") + "`", ephemeral: true });
      if (!botchannelperms.has(command.permissions.bot[1])) return await interaction.reply({ content: "Sorry, I don't have sufficient permissions to run that command **in this channel**.\nRequired permissions:\n`" + (!(new Discord.PermissionsBitField(command.permissions.bot[1]).has(8n)) ? (new Discord.PermissionsBitField(command.permissions.bot[1]).toArray().join(", ") || "None") : "Administrator") + "`", ephemeral: true });
    }
    try {
      internalCooldown.add(interaction.user.id);
      await command.run(bot, interaction);
    } catch (err) {
      if (err.name === "StructureError") {
        if (interaction.replied) await interaction.editReply(err.message).catch(() => { });
        else await interaction.reply({ content: err.message, ephemeral: true }).catch(() => { });
        return;
      }
      console.error(err);
      if (interaction.replied) await interaction.editReply("Something happened! Here's a debug: " + err).catch(() => { });
      else await interaction.reply({ content: `Something happened! Here's a debug: ${err}`, ephemeral: true }).catch(() => { });
    } finally {
      internalCooldown.delete(interaction.user.id);
    }
  }
  if (interaction.isSelectMenu() && interaction.customId.startsWith("selectroles_f")) {
    await interaction.member.fetch({ cache: true }).catch(() => { });
    if (!bot.guilds.cache.has(interaction.guild.id)) return await interaction.deferUpdate();
    if (!interaction.guild.members.me.permissions.has("ManageRoles")) return await interaction.reply({ content: "I don't have permissions to add roles. Contact an administrator to fix the problem.", ephemeral: true })
    const roles = interaction.values?.map(e => e.split("_")[3]) || [];
    if (!roles.length) return await interaction.deferUpdate();
    const rolesToManage = roles.filter(e => interaction.guild.roles.cache.get(e)?.editable && !(interaction.guild.roles.cache.get(e)?.managed));
    if (!rolesToManage.length) await interaction.reply({ content: `I cannot add/remove the requested role${roles.length ? "s" : ""}. Contact an administrator to fix the problem.`, ephemeral: true });
    else {
      const rolesToAdd = rolesToManage.filter(e => !interaction.member.roles.cache.has(e));
      const rolesToRemove = rolesToManage.filter(e => interaction.member.roles.cache.has(e));
      if (rolesToAdd.length) await interaction.member.roles.add(rolesToAdd, "Select-roles function");
      if (rolesToRemove.length) await interaction.member.roles.remove(rolesToRemove, "Select-roles function");
      if (roles.length === rolesToManage.length) interaction.reply({ content: `I've added/removed ${roles.length > 1 ? "all the roles" : "the role"} you have requested.`, ephemeral: true });
      else {
        const notManagedRoles = roles.filter(e => !rolesToManage.includes(e));
        await interaction.reply({ content: `I've added/removed the requested roles except for: ${notManagedRoles.map(e => `<@&${e}>`).join(", ")}. Contact an administrator to fix the problem.`, ephemeral: true })
      }
    }
  }
  if (interaction.isButton()) {
    if (interaction.customId === "ticket_f") {
      const doc = await tickets.findOne({
        guildId: { $eq: interaction.guildId },
        messageId: { $eq: interaction.message.id },
        channelId: { $eq: interaction.channelId }
      }).lean();

      if (doc) {
        const { categoryId } = doc;
        await bot.users.fetch(interaction.user.id);
        const doc2 = await tmembers.findOne({
          guildId: { $eq: interaction.guildId },
          from: { $eq: interaction.message.id },
          memberId: { $eq: interaction.user.id }
        }).lean();
        if (doc2) return await interaction.reply({ content: "You already have a ticket!", ephemeral: true }).catch(() => { });
        const cat = interaction.guild.channels.cache.get(categoryId) || await interaction.guild.channels.fetch(categoryId).catch(() => { });
        if (!cat) return await interaction.reply({ content: "I don't have permissions, sorry :(\nContact your server administrator.", ephemeral: true });
        if (!cat.permissionsFor(bot.user.id).has(["ViewChannel", "ManageChannels", "ManageRoles"])) return await interaction.reply({ content: "I don't have permissions, sorry :(\nContact your server administrator.", ephemeral: true });
        const todesc = doc.desc?.replace(/%AUTHOR%/g, interaction.user.toString());
        const ch = await interaction.guild.channels
          .create({
            name: `${interaction.user.username}s-ticket`,
            type: 0,
            topic: todesc,
            parent: cat,
            reason: "User created a ticket!"
          }).catch(() => { });
        if (!ch) return await interaction.reply({ content: "I don't have permissions, sorry :(\nContact your server administrator.", ephemeral: true });
        const tmp = await ch.permissionOverwrites.create(interaction.user.id, {
          ViewChannel: true,
          SendMessages: true,
          EmbedLinks: true,
          AttachFiles: true
        }, { type: 1 }).catch(() => { });
        if (!tmp) return await interaction.reply({ content: "I don't have permissions, sorry :(\nContact your server administrator.", ephemeral: true });

        await tmembers.create({
          guildId: interaction.guild.id,
          channelId: ch.id,
          memberId: interaction.user.id,
          from: interaction.message.id
        });

        if (doc.welcomemsg && ch.permissionsFor(bot.user.id).has("SendMessages")) {
          const tosend = doc.welcomemsg.replace(/%AUTHOR%/g, interaction.user.toString());
          ch.send({ content: tosend, allowedMentions: { parse: ['users', 'roles', 'everyone'] } }).catch(() => { });
        }
        await interaction.reply({ content: `Your ticket has been created! -> ${ch}`, ephemeral: true });
      } else {
        await interaction.deferUpdate();
        await interaction.message.delete();
      }
    }
    if (interaction.customId.startsWith("ww_hb")) {
      const [, , mode, id] = interaction.customId.split("_");
      if (mode === "publish") {
        const res = await fetch(`https://wubbworld.xyz/api/birthday-cards/${id}/publish`, { method: "PUT", headers: { "authorization": process.env.VERYS } });
        if (!res.ok) await interaction.reply({ content: `Error: ${await res.text()}` });
        else await interaction.update({ embeds: [Discord.EmbedBuilder.from(interaction.message.embeds[0]).setColor("Green").setFooter({ text: "Approved on" }).setTimestamp(new Date())], components: [] });
      } else if (mode === "reject") {
        const res = await fetch(`https://wubbworld.xyz/api/birthday-cards/${id}/reject`, { method: "PUT", headers: { "authorization": process.env.VERYS } });
        if (!res.ok) await interaction.reply({ content: `Error: ${await res.text()}` });
        else await interaction.update({ embeds: [Discord.EmbedBuilder.from(interaction.message.embeds[0]).setColor("Red").setFooter({ text: "Rejected on" }).setTimestamp(new Date())], components: [] });
      }
    }
  }
  if (interaction.type === 4) {
    if (interaction.commandName === "google") {
      const option = interaction.options.getFocused();
      let tosend = Object.entries(languages).filter(e => !(typeof e[1] === "function" || e[0] === "auto")).map(e => {
        return { name: e[1], value: e[0] };
      });
      if (option) tosend = tosend.filter(e => e.name.toLowerCase().startsWith(option.toLowerCase()));
      await interaction.respond(tosend.slice(0, 25));
    }
  }
}