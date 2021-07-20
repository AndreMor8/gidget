import { Util } from 'discord.js';
import tickets from "../../database/models/tmembers.js";
import tmembers from "../../database/models/ticket.js";

export default class extends SlashCommand {
  constructor(options) {
    super(options);
    this.deployOptions.description = "Close a user ticket";
    this.deployOptions.options = [{
      name: "reason",
      type: "STRING",
      description: "Reason for closing the ticket",
      required: false
    }]
    this.guildonly = true;
    this.permissions = {
      user: [0n, 0n],
      bot: [0n, 16n]
    };
  }
  async run(bot, interaction) {
    const doc2 = await tickets.findOne({ guildId: { $eq: interaction.guild.id }, channelId: { $eq: interaction.channel.id } })
    if (!doc2) return interaction.reply("This isn't a ticket-type chat!");
    const { memberId, manual, roles, from } = doc2;
    const doc = await tmembers.findOne({ guildId: { $eq: interaction.guild.id }, messageId: { $eq: from } });
    if (!doc) return interaction.reply("There is no ticket system here.");
    const reason = interaction.options.get("reason")?.value;
    const finish = async (staff = false) => {
      try {
        await interaction.reply("Closing ticket...");
        const member = interaction.guild.members.cache.get(memberId) || await interaction.guild.members.cache.fetch(memberId).catch(() => { });
        await interaction.channel.delete(Util.splitMessage(`Ticket from ${member?.user.tag || memberId} closed by ${interaction.user.tag} ${reason ? `with reason: ${reason}` : ""}`, { maxLength: 500 })[0]);
        await member?.send(Util.splitMessage(staff ? reason ? "Your ticket was closed by " + interaction.user.tag + " with reason: " + reason : "Your ticket was closed by " + interaction.user.tag : 'You have successfully closed your ticket.', { maxLength: 2000 })[0]).catch(() => { });
        await doc2.deleteOne();
      } catch (err) {
        console.log(err);
      }
    }
    if (interaction.channel.permissionsFor(interaction.user.id).has("MANAGE_CHANNELS")) {
      finish(true);
    } else {
      if (!roles.some(e => interaction.member.roles.cache.has(e))) {
        if (manual) {
          if (memberId === interaction.member.id) {
            finish();
          } else interaction.reply("You do not have sufficient permissions to close this ticket.");
        }
        else interaction.reply("You do not have sufficient permissions to close this ticket.");
      } else {
        finish(true);
      }
    }
  }
}