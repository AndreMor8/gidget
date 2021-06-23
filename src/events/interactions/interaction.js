import Discord from 'discord.js-light';
const internalCooldown = new Set();

export default async (bot, interaction) => {
    if (interaction.isCommand()) {
        if (internalCooldown.has(interaction.user.id)) return interaction.reply({ content: "Calm down! Wait until the previous command finished executing.", ephemeral: true });
        const command = bot.slashCommands.get(interaction.commandName);
        if (!command) return interaction.reply({ content: "That command doesn't exist", ephemeral: true });
        if (!interaction.guild && command.guildonly) return interaction.reply("This command only works on servers");
        if (interaction.guild) {
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
}